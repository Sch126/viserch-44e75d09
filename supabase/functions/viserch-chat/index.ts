import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the Viserch Learning Assistant. Your goal is to help neurodivergent students. Use the Agent 4 (ADHD Critic) persona:

**Core Principles:**
• Be concise and direct - no fluff
• Use bullet points for clarity
• Explain complex terms from the very base level
• Break down information into digestible chunks
• Use analogies that connect to everyday experiences
• Highlight key takeaways clearly
• If something is important, say it upfront

**Linguistic Chameleon Protocol:**
You must be a "Linguistic Chameleon" - adapt your communication style to match the user:

• If the user uses modern slang (e.g., "bet", "no cap", "fr", "lowkey"), acknowledge it subtly to build rapport, then pivot back to the lesson. Example: "Bet, let me break that down for you..."

• If the user uses formal/professional language, mirror that level of sophistication immediately. Match their vocabulary complexity and tone.

• Always prioritize the **Information-to-Word ratio** (high info, low fluff) to respect the student's attention span.

**Formatting:**
• Use **bold** for key terms and important concepts
• Use *italics* for emphasis or when introducing new vocabulary
• Use bullet points to break down complex ideas
• Keep paragraphs short (2-3 sentences max)

Remember: Clarity over complexity. Action over abstraction. Adapt to connect.`;

// Input validation schema
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

function validateChatRequest(body: unknown): ChatRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }

  const req = body as Record<string, unknown>;
  
  if (!Array.isArray(req.messages)) {
    throw new Error('Messages must be an array');
  }

  if (req.messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }

  if (req.messages.length > 50) {
    throw new Error('Too many messages (max 50)');
  }

  const validRoles = ['user', 'assistant', 'system'];
  
  const validatedMessages: ChatMessage[] = req.messages.map((msg, index) => {
    if (!msg || typeof msg !== 'object') {
      throw new Error(`Message at index ${index} is invalid`);
    }

    const message = msg as Record<string, unknown>;
    
    if (typeof message.role !== 'string' || !validRoles.includes(message.role)) {
      throw new Error(`Invalid role at message ${index}`);
    }

    if (typeof message.content !== 'string') {
      throw new Error(`Content must be a string at message ${index}`);
    }

    // Sanitize content: limit length and strip potential injection patterns
    const sanitizedContent = message.content
      .slice(0, 10000) // Max 10k chars per message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .trim();

    if (sanitizedContent.length === 0) {
      throw new Error(`Empty content at message ${index}`);
    }

    return {
      role: message.role as ChatMessage['role'],
      content: sanitizedContent,
    };
  });

  return { messages: validatedMessages };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    const rawBody = await req.json();
    const { messages } = validateChatRequest(rawBody);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing chat request with ${messages.length} messages`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Usage limit reached");
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("viserch-chat error:", errorMessage);
    
    // Return user-friendly error but log technical details
    const isValidationError = errorMessage.includes('Invalid') || 
                              errorMessage.includes('must be') || 
                              errorMessage.includes('cannot be');
    
    return new Response(JSON.stringify({ 
      error: isValidationError ? errorMessage : "Something went wrong. Please try again."
    }), {
      status: isValidationError ? 400 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
