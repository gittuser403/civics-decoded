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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use AI to look up representative information
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides information about U.S. Congressional representatives based on ZIP codes. Provide realistic representative information including name, party, district, email, phone, and website. Format your response as a JSON object with these fields: name, party, district, email, phone, website.'
          },
          {
            role: 'user',
            content: `What is the U.S. House Representative for ZIP code ${zipCode}? Provide the information in JSON format with fields: name, party, district, email, phone, website.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to lookup representative information' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    console.log('AI Response:', aiResponse);

    // Parse the AI response to extract representative info
    let repInfo;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        repInfo = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create a structured response from the text
        repInfo = {
          name: 'Representative information',
          party: 'Unknown',
          district: `ZIP ${zipCode}`,
          email: 'contact@house.gov',
          phone: '(202) 225-3121',
          website: 'https://www.house.gov'
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback response
      repInfo = {
        name: 'Representative information',
        party: 'Unknown',
        district: `ZIP ${zipCode}`,
        email: 'contact@house.gov',
        phone: '(202) 225-3121',
        website: 'https://www.house.gov'
      };
    }

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
