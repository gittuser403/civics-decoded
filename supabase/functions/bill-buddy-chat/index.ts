import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000)
});

const BillContextSchema = z.object({
  billNumber: z.string().max(50),
  title: z.string().max(500),
  description: z.string().max(1000),
  fullText: z.string().max(50000),
  status: z.string().max(100),
  category: z.string().max(100)
}).optional();

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
  billContext: BillContextSchema
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

    const { messages, billContext } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[bill-buddy-chat] Missing LOVABLE_API_KEY configuration');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt with bill context if available
    let systemPrompt = `You are Bill Buddy, a friendly AI assistant designed to help students understand legislation and civic processes. Your role is to:
- Explain bills and legislative concepts in clear, simple language appropriate for middle and high school students
- Answer questions about how government works
- Break down complex legal language into easy-to-understand terms
- Encourage civic engagement and understanding
- Be encouraging and educational

Keep responses concise and engaging. Use examples when helpful.`;

    if (billContext) {
      systemPrompt += `\n\nYou are currently discussing this bill:
Bill Number: ${billContext.billNumber}
Title: ${billContext.title}
Description: ${billContext.description}
Status: ${billContext.status}
Category: ${billContext.category}

Full Bill Text:
${billContext.fullText.substring(0, 15000)}${billContext.fullText.length > 15000 ? '...' : ''}

Use this context to answer questions about this specific bill.`;
    }

    console.log('Sending request to AI with', messages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[bill-buddy-chat] AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Unable to process request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('Generated response successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[bill-buddy-chat] Function error:', {
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
