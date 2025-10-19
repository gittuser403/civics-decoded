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

    console.log('Starting master legislative data sync...');

    const results = {
      congress: { success: false, count: 0, error: null as string | null },
      govtrack: { success: false, count: 0, error: null as string | null },
      openstates: { success: false, count: 0, error: null as string | null },
    };

    // Sync Congress.gov
    try {
      const congressResponse = await supabase.functions.invoke('sync-congress-bills');
      if (congressResponse.data?.success) {
        results.congress.success = true;
        results.congress.count = congressResponse.data.billsSynced;
      }
    } catch (error) {
      console.error('Error syncing Congress.gov:', error);
      results.congress.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Sync GovTrack
    try {
      const govtrackResponse = await supabase.functions.invoke('sync-govtrack-bills');
      if (govtrackResponse.data?.success) {
        results.govtrack.success = true;
        results.govtrack.count = govtrackResponse.data.billsSynced;
      }
    } catch (error) {
      console.error('Error syncing GovTrack:', error);
      results.govtrack.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Sync Open States
    try {
      const openstatesResponse = await supabase.functions.invoke('sync-openstates-bills');
      if (openstatesResponse.data?.success) {
        results.openstates.success = true;
        results.openstates.count = openstatesResponse.data.billsSynced;
      }
    } catch (error) {
      console.error('Error syncing Open States:', error);
      results.openstates.error = error instanceof Error ? error.message : 'Unknown error';
    }

    const totalSynced = results.congress.count + results.govtrack.count + results.openstates.count;

    console.log(`Master sync completed. Total bills synced: ${totalSynced}`);
    console.log('Results:', JSON.stringify(results, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true,
        totalBillsSynced: totalSynced,
        sources: results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[sync-legislative-data] Function error:', {
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
