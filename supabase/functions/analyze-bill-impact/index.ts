import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  billId: z.string().uuid(),
  billTitle: z.string().min(1).max(500),
  billNumber: z.string().min(1).max(50),
  shortDescription: z.string().max(1000),
  fullText: z.string().min(1).max(100000)
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

    const { billId, billTitle, billNumber, shortDescription, fullText } = parseResult.data;
    
    console.log('Analyzing impact for bill:', billTitle);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!lovableApiKey || !supabaseUrl || !supabaseKey) {
      console.error('[analyze-bill-impact] Missing required configuration');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Analyze impact using Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a policy analyst expert. Analyze the bill and provide comprehensive impact analysis.'
          },
          {
            role: 'user',
            content: `Analyze the impact of this bill:
Bill Number: ${billNumber}
Title: ${billTitle}
Description: ${shortDescription}
Full Text: ${fullText.substring(0, 2000)}

Provide analysis including:
- Affected population (who this impacts)
- Cost estimate (financial implications)
- Geographic scope (where this applies)
- Timeline (implementation timeframe)
- Affected sectors (industries/areas impacted)`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_impact",
            description: "Return the bill impact analysis",
            parameters: {
              type: "object",
              properties: {
                affected_population: { type: "string" },
                cost_estimate: { type: "string" },
                geographic_scope: { type: "string" },
                timeline: { type: "string" },
                sectors: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["affected_population", "cost_estimate", "geographic_scope", "timeline", "sectors"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_impact" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[analyze-bill-impact] AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Unable to analyze bill impact' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data));

    const toolCall = data.choices[0].message.tool_calls[0];
    const impactData = JSON.parse(toolCall.function.arguments);

    console.log('Generated impact:', impactData);

    // Update bill with impact data
    const { error: updateError } = await supabase
      .from('bills')
      .update({ impact_data: impactData })
      .eq('id', billId);

    if (updateError) {
      console.error('Error updating bill:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ impact: impactData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[analyze-bill-impact] Function error:', {
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return new Response(
      JSON.stringify({ error: 'An error occurred analyzing impact' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
