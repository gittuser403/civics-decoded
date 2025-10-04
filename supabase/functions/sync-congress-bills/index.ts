import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const congressApiKey = Deno.env.get('CONGRESS_GOV_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting Congress.gov bill sync...');

    const logId = crypto.randomUUID();
    await supabase.from('sync_log').insert({
      id: logId,
      source: 'congress.gov',
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });

    // Fetch recent bills from Congress.gov API
    const currentCongress = 119; // 119th Congress (2025-2027)
    const response = await fetch(
      `https://api.congress.gov/v3/bill/${currentCongress}?api_key=${congressApiKey}&format=json&limit=250`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Congress.gov API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.bills?.length || 0} bills from Congress.gov`);

    let syncedCount = 0;

    for (const bill of data.bills || []) {
      try {
        // Map Congress.gov status to our status system
        const mapStatus = (latestAction: string) => {
          const action = latestAction?.toLowerCase() || '';
          if (action.includes('became public law') || action.includes('enacted')) return 'Enacted';
          if (action.includes('passed senate')) return 'Passed Senate';
          if (action.includes('passed house')) return 'Passed House';
          if (action.includes('committee')) return 'Committee Review';
          return 'Introduced';
        };

        const billData = {
          bill_number: bill.number,
          title: bill.title || 'Untitled Bill',
          short_description: bill.title?.substring(0, 200) || '',
          full_text: bill.title || '',
          status: mapStatus(bill.latestAction?.text),
          introduced_date: bill.introducedDate || new Date().toISOString().split('T')[0],
          category: bill.type === 'hr' ? 'House' : bill.type === 's' ? 'Senate' : 'Other',
          sponsor: bill.sponsors?.[0]?.fullName || null,
          source: 'congress.gov',
          external_id: `congress-${currentCongress}-${bill.type}-${bill.number}`,
          last_synced: new Date().toISOString(),
          cosponsors: bill.cosponsors || [],
          official_url: bill.url || `https://www.congress.gov/bill/${currentCongress}th-congress/${bill.type}-bill/${bill.number}`,
        };

        // Upsert bill (update if exists, insert if new)
        const { error } = await supabase
          .from('bills')
          .upsert(billData, { onConflict: 'external_id', ignoreDuplicates: false });

        if (error) {
          console.error('Error upserting bill:', error);
        } else {
          syncedCount++;
        }
      } catch (billError) {
        console.error('Error processing bill:', billError);
      }
    }

    // Update sync log
    await supabase.from('sync_log').update({
      status: 'completed',
      bills_synced: syncedCount,
      completed_at: new Date().toISOString(),
    }).eq('id', logId);

    console.log(`Congress.gov sync completed: ${syncedCount} bills synced`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        source: 'congress.gov',
        billsSynced: syncedCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-congress-bills:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
