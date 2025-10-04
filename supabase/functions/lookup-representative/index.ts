import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zipCode } = await req.json();

    if (!zipCode || zipCode.length !== 5) {
      return new Response(
        JSON.stringify({ error: 'Invalid ZIP code. Please provide a 5-digit ZIP code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Looking up representative for ZIP code:', zipCode);

    // Use Google Civic Information API for accurate representative lookup
    const GOOGLE_CIVIC_API_KEY = Deno.env.get('GOOGLE_CIVIC_API_KEY');
    if (!GOOGLE_CIVIC_API_KEY) {
      throw new Error('GOOGLE_CIVIC_API_KEY is not configured');
    }

    const civicUrl = new URL('https://civicinfo.googleapis.com/civicinfo/v2/representatives');
    civicUrl.searchParams.set('address', zipCode);
    civicUrl.searchParams.set('levels', 'country');
    civicUrl.searchParams.set('roles', 'legislatorLowerBody'); // U.S. House of Representatives
    civicUrl.searchParams.set('key', GOOGLE_CIVIC_API_KEY);

    const civicResp = await fetch(civicUrl.toString());
    if (!civicResp.ok) {
      const errorText = await civicResp.text();
      console.error('Civic API error:', civicResp.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to lookup representative information (Civic API error).' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const civicData = await civicResp.json();

    const offices = civicData.offices ?? [];
    const officials = civicData.officials ?? [];

    if (!officials.length) {
      console.warn('No officials found for ZIP:', zipCode, civicData);
      return new Response(
        JSON.stringify({ error: 'No representative found for this ZIP code.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prefer the official linked from an office that matches legislatorLowerBody
    let officialIndex = 0;
    let divisionId: string | undefined;
    for (const office of offices) {
      if (Array.isArray(office.officialIndices)) {
        const idx = office.officialIndices.find((i: number) => officials[i]);
        if (idx !== undefined) {
          officialIndex = idx;
          divisionId = office.divisionId;
          break;
        }
      }
    }

    const official = officials[officialIndex];

    // Derive district like "MA-02" from divisionId (e.g. ocd-division/country:us/state:ma/cd:2)
    let district = `ZIP ${zipCode}`;
    try {
      const div = divisionId || (offices[0]?.divisionId as string | undefined);
      if (div) {
        const stateMatch = div.match(/state:([a-z]{2})/i);
        const cdMatch = div.match(/cd:(\d{1,2})/i);
        if (stateMatch && cdMatch) {
          const state = stateMatch[1].toUpperCase();
          const cd = cdMatch[1].padStart(2, '0');
          district = `${state}-${cd}`;
        }
      }
    } catch (_) {
      // keep default district
    }

    const repInfo = {
      name: official.name || 'Unknown',
      party: (official.party || 'Unknown').replace(' Party', ''),
      district,
      email: official.emails?.[0] || 'contact@house.gov',
      phone: official.phones?.[0] || '(202) 225-3121',
      website: official.urls?.[0] || 'https://www.house.gov',
    };

    console.log('Resolved Representative:', repInfo);


    return new Response(
      JSON.stringify({ representative: repInfo }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lookup-representative function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
