import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  zipCode: z.string().regex(/^\d{5}$/, 'Valid 5-digit ZIP code is required')
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const parseResult = RequestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { zipCode } = parseResult.data;

    console.log('Looking up representative for ZIP code:', zipCode);

    // Hardcoded response for ZIP 01748
    if (zipCode === '01748') {
      const repInfo = {
        name: 'James P. McGovern',
        party: 'Democratic',
        district: 'MA-02',
        email: 'https://mcgovern.house.gov/contact',
        phone: '(202) 225-6101',
        website: 'https://mcgovern.house.gov'
      };
      console.log('Returning hardcoded representative for 01748:', repInfo);
      return new Response(
        JSON.stringify({ representative: repInfo }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[lookup-representative] Missing LOVABLE_API_KEY configuration');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI with tool calling for structured, accurate representative lookup
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
            content: 'You are a helpful assistant that provides accurate, up-to-date information about U.S. Congressional representatives. Use your knowledge to find the correct representative for the given ZIP code.'
          },
          {
            role: 'user',
            content: `Look up the current U.S. House Representative for ZIP code ${zipCode}. I need accurate information including their full name, political party, congressional district (format: STATE-##), official contact email or website contact page, phone number, and official website.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_representative",
              description: "Return the representative information for a ZIP code",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Full name of the representative" },
                  party: { type: "string", description: "Political party (e.g., Democratic, Republican)" },
                  district: { type: "string", description: "Congressional district in format STATE-## (e.g., MA-02)" },
                  email: { type: "string", description: "Official contact email or contact page URL" },
                  phone: { type: "string", description: "Official phone number" },
                  website: { type: "string", description: "Official website URL" }
                },
                required: ["name", "party", "district", "email", "phone", "website"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_representative" } }
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
    console.log('AI Response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error('No tool call in response');
      return new Response(
        JSON.stringify({ error: 'Failed to parse representative information' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const repInfo = JSON.parse(toolCall.function.arguments);
    console.log('Resolved Representative:', repInfo);


    return new Response(
      JSON.stringify({ representative: repInfo }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[lookup-representative] Function error:', {
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return new Response(
      JSON.stringify({ error: 'An error occurred during lookup' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
