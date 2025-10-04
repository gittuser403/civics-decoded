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
    const { billId, billTitle, billNumber, shortDescription, fullText } = await req.json();
    
    console.log('Analyzing impact for bill:', billTitle);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
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
    console.error('Error in analyze-bill-impact:', error);
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
