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
    const openstatesApiKey = Deno.env.get('OPENSTATES_API_KEY');
    if (!openstatesApiKey) {
      throw new Error('OPENSTATES_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting Open States bill sync...');

    const logId = crypto.randomUUID();
    await supabase.from('sync_log').insert({
      id: logId,
      source: 'openstates',
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });

    // Fetch recent bills from popular states
    const states = ['ca', 'ny', 'tx', 'fl']; // California, New York, Texas, Florida
    let syncedCount = 0;

    for (const jurisdiction of states) {
      try {
        const response = await fetch(
          `https://v3.openstates.org/bills?jurisdiction=${jurisdiction}&page=1&per_page=50`,
          {
            headers: {
              'X-API-Key': openstatesApiKey,
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error(`Open States API error for ${jurisdiction}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`Fetched ${data.results?.length || 0} bills from ${jurisdiction.toUpperCase()}`);

        for (const bill of data.results || []) {
          try {
            // Map Open States status to our status system
            const mapStatus = (classification: string[]) => {
              const classes = classification?.map(c => c.toLowerCase()) || [];
              if (classes.includes('passed')) return 'Passed';
              if (classes.includes('committee')) return 'Committee Review';
              return 'Introduced';
            };

            const billData = {
              bill_number: bill.identifier,
              title: bill.title || 'Untitled Bill',
              short_description: bill.title?.substring(0, 200) || '',
              full_text: bill.title || '',
              status: mapStatus(bill.classification),
              introduced_date: bill.first_action_date || new Date().toISOString().split('T')[0],
              category: `State: ${jurisdiction.toUpperCase()}`,
              sponsor: bill.sponsorships?.[0]?.name || null,
              source: 'openstates',
              external_id: `openstates-${bill.id}`,
              last_synced: new Date().toISOString(),
              cosponsors: bill.sponsorships?.slice(1) || [],
              official_url: bill.openstates_url || `https://openstates.org/${jurisdiction}/bills/${bill.session}/${bill.identifier}/`,
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
      } catch (stateError) {
        console.error(`Error syncing ${jurisdiction}:`, stateError);
      }
    }

    // Update sync log
    await supabase.from('sync_log').update({
      status: 'completed',
      bills_synced: syncedCount,
      completed_at: new Date().toISOString(),
    }).eq('id', logId);

    console.log(`Open States sync completed: ${syncedCount} bills synced`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        source: 'openstates',
        billsSynced: syncedCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[sync-openstates-bills] Function error:', {
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return new Response(
      JSON.stringify({ error: 'An error occurred during synchronization' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
