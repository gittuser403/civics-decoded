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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting GovTrack bill sync...');

    const logId = crypto.randomUUID();
    await supabase.from('sync_log').insert({
      id: logId,
      source: 'govtrack',
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });

    // Fetch recent bills from GovTrack API (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];

    const response = await fetch(
      `https://www.govtrack.us/api/v2/bill?introduced_date__gte=${dateFilter}&limit=250`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GovTrack API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.objects?.length || 0} bills from GovTrack`);

    let syncedCount = 0;

    for (const bill of data.objects || []) {
      try {
        // Map GovTrack status to our status system
        const mapStatus = (current_status: string) => {
          const status = current_status?.toLowerCase() || '';
          if (status.includes('enacted')) return 'Enacted';
          if (status.includes('pass_over:senate')) return 'Passed Senate';
          if (status.includes('pass_over:house')) return 'Passed House';
          if (status.includes('referred')) return 'Committee Review';
          return 'Introduced';
        };

        const billData = {
          bill_number: bill.display_number || bill.number,
          title: bill.title || 'Untitled Bill',
          short_description: bill.title_without_number?.substring(0, 200) || bill.title?.substring(0, 200) || '',
          full_text: bill.title || '',
          status: mapStatus(bill.current_status),
          introduced_date: bill.introduced_date || new Date().toISOString().split('T')[0],
          category: bill.bill_type?.includes('h.r.') ? 'House' : bill.bill_type?.includes('s.') ? 'Senate' : 'Other',
          sponsor: bill.sponsor?.name || null,
          source: 'govtrack',
          external_id: `govtrack-${bill.id}`,
          last_synced: new Date().toISOString(),
          cosponsors: bill.cosponsors || [],
          committees: bill.committees || [],
          official_url: `https://www.govtrack.us${bill.link}`,
        };

        // Upsert bill
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

    console.log(`GovTrack sync completed: ${syncedCount} bills synced`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        source: 'govtrack',
        billsSynced: syncedCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-govtrack-bills:', error);
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
