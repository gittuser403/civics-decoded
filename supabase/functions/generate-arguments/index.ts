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
    const { billText, billTitle } = await req.json();

    if (!billText || !billTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing billText or billTitle' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating arguments for bill:', billTitle);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

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
            content: 'You are an expert policy analyst who provides balanced, fact-based arguments for and against legislative bills. Generate 3 arguments supporting the bill and 3 arguments opposing it. Each argument should be clear, concise, and cite a credible perspective or source.'
          },
          {
            role: 'user',
            content: `Generate balanced arguments for and against this bill:\n\nTitle: ${billTitle}\n\nBill Text: ${billText}\n\nProvide 3 supporting arguments and 3 opposing arguments. Each should be factual, balanced, and represent real stakeholder perspectives.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_arguments",
              description: "Return the for and against arguments for a bill",
              parameters: {
                type: "object",
                properties: {
                  arguments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        side: { 
                          type: "string", 
                          enum: ["for", "against"],
                          description: "Whether this argument supports or opposes the bill" 
                        },
                        text: { 
                          type: "string",
                          description: "The argument text, 2-3 sentences max"
                        },
                        source: { 
                          type: "string",
                          description: "The perspective or stakeholder group this represents (e.g., 'Education advocates', 'Fiscal conservatives', 'Healthcare providers')"
                        }
                      },
                      required: ["side", "text", "source"],
                      additionalProperties: false
                    },
                    minItems: 6,
                    maxItems: 6
                  }
                },
                required: ["arguments"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_arguments" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate arguments' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error('No tool call in response');
      return new Response(
        JSON.stringify({ error: 'Failed to parse arguments' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('Generated arguments:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-arguments function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
