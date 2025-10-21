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
  status: z.string().min(1).max(100)
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

    const { billId, billTitle, billNumber, status } = parseResult.data;
    
    console.log('Generating stages for bill:', billTitle);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!lovableApiKey || !supabaseUrl || !supabaseKey) {
      console.error('[generate-bill-stages] Missing required configuration');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate stages using Lovable AI
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
            content: 'You are a legislative expert. Generate realistic bill progress stages based on the bill information and current status.'
          },
          {
            role: 'user',
            content: `Generate legislative progress stages for this bill:
Bill Number: ${billNumber}
Title: ${billTitle}
Current Status: ${status}

Return stages with these statuses:
- "completed" for stages already done
- "current" for the active stage
- "pending" for future stages

Include typical congressional stages like: Introduced, Committee Review, House Vote, Senate Vote, Presidential Action, etc.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_stages",
            description: "Return the bill stages",
            parameters: {
              type: "object",
              properties: {
                stages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      status: { type: "string", enum: ["completed", "current", "pending"] },
                      date: { type: "string" }
                    },
                    required: ["name", "status"]
                  }
                }
              },
              required: ["stages"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_stages" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-bill-stages] AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Unable to generate bill stages' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data));

    const toolCall = data.choices[0].message.tool_calls[0];
    const stages = JSON.parse(toolCall.function.arguments).stages;

    console.log('Generated stages:', stages);

    // Update bill with stages
    const { error: updateError } = await supabase
      .from('bills')
      .update({ stages })
      .eq('id', billId);

    if (updateError) {
      console.error('Error updating bill:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ stages }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-bill-stages] Function error:', {
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return new Response(
      JSON.stringify({ error: 'An error occurred generating stages' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
