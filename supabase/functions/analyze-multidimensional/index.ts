import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TesseractResponse {
  storyboard: Array<{
    timestamp: string;
    visual_description: string;
    narration: string;
  }>;
  analogies: Array<{
    concept: string;
    simple_explanation: string;
    scientific_proof: string;
    risk_level: "safe" | "moderate" | "risky";
  }>;
  focus_score: number;
  facts_extracted: number;
}

// Maximum iterations for any agent negotiation loops
const MAX_ITERATIONS = 5;

// Memory-safe base64 encoding for large files
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192; // Process 8KB at a time to avoid stack overflow
  let binary = "";
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
}

// Extract only the relevant snippet for a specific scene/fact
function extractSnippet(fullContent: string, factIndex: number, factsTotal: number): string {
  const avgChunkSize = Math.ceil(fullContent.length / Math.max(factsTotal, 1));
  const start = Math.max(0, factIndex * avgChunkSize - 500);
  const end = Math.min(fullContent.length, (factIndex + 1) * avgChunkSize + 500);
  return fullContent.slice(start, end);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const pdfFile = formData.get("pdf") as File;
    const userId = formData.get("user_id") as string;
    const projectId = formData.get("project_id") as string | null;

    if (!pdfFile) {
      throw new Error("No PDF file provided");
    }

    if (!userId) {
      throw new Error("No user_id provided");
    }

    console.log(`Starting Tesseract Pipeline for: ${pdfFile.name}`);
    console.log(`User ID: ${userId}, Project ID: ${projectId || "none"}`);

    // Initialize Supabase with SERVICE_ROLE_KEY to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get agent prompts from environment variables
    const PROMPT_DIMENSION_X = Deno.env.get("PROMPT_DIMENSION_X") || `You are Dimension X (The Anchor). Extract all factual claims, definitions, equations, and data points from this academic PDF. 
For each fact, provide:
- The exact fact or claim
- Page number if identifiable
- Line reference or section
- Category (definition, equation, data, claim, method)
- Confidence score (0.0-1.0)
Output as JSON array.`;

    const PROMPT_DIMENSION_Y = Deno.env.get("PROMPT_DIMENSION_Y") || `You are Dimension Y (The Narrative Director). 
Transform these extracted facts into a Kurzgesagt-style educational script.
Create vivid analogies, engaging narratives, and memorable visual descriptions.
Structure as a storyboard with timestamps and visual cues.
Make complex concepts accessible while maintaining scientific accuracy.`;

    const PROMPT_DIMENSION_Z = Deno.env.get("PROMPT_DIMENSION_Z") || `You are Dimension Z (The Auditor).
Compare the narrative script against the original facts.
Flag any analogy that oversimplifies to the point of being scientifically misleading.
Rate each analogy as: safe, moderate, or risky.
Provide the original scientific proof for each concept.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Read PDF content with memory-safe base64 encoding
    console.log("Reading PDF file...");
    const pdfBytes = await pdfFile.arrayBuffer();
    console.log(`PDF size: ${pdfBytes.byteLength} bytes`);
    
    // Use chunked base64 encoding to prevent stack overflow
    const pdfBase64 = arrayBufferToBase64(pdfBytes);
    console.log(`Base64 encoded successfully, length: ${pdfBase64.length}`);

    console.log("DIMENSION X: Extracting facts...");
    
    // ============ DIMENSION X: Extract Facts ============
    // Flat async/await pattern - no recursion
    let dimensionXContent = "[]";
    let dimensionXAttempts = 0;
    
    while (dimensionXAttempts < MAX_ITERATIONS) {
      dimensionXAttempts++;
      console.log(`Dimension X attempt ${dimensionXAttempts}/${MAX_ITERATIONS}`);
      
      try {
        const dimensionXResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { 
                role: "system", 
                content: PROMPT_DIMENSION_X 
              },
              { 
                role: "user", 
                content: `Analyze this PDF document and extract all facts. PDF Name: ${pdfFile.name}\n\nRespond with a JSON array of facts. Each fact should have: fact, page_number, line_reference, category, confidence_score.`
              }
            ],
          }),
        });

        if (dimensionXResponse.ok) {
          const dimensionXData = await dimensionXResponse.json();
          dimensionXContent = dimensionXData.choices?.[0]?.message?.content || "[]";
          break; // Success, exit loop
        } else {
          const errorText = await dimensionXResponse.text();
          console.error(`Dimension X attempt ${dimensionXAttempts} failed:`, errorText);
          if (dimensionXAttempts >= MAX_ITERATIONS) {
            console.log("Dimension X: Max iterations reached, proceeding with best available");
          }
        }
      } catch (fetchError) {
        console.error(`Dimension X fetch error attempt ${dimensionXAttempts}:`, fetchError);
        if (dimensionXAttempts >= MAX_ITERATIONS) {
          console.log("Dimension X: Max iterations reached due to errors");
        }
      }
    }
    
    // Parse extracted facts
    let extractedFacts: Array<{
      fact: string;
      page_number?: number;
      line_reference?: string;
      category?: string;
      confidence_score?: number;
    }> = [];

    try {
      // Try to extract JSON from the response
      const jsonMatch = dimensionXContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractedFacts = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse Dimension X output:", parseError);
      // Create a single fact from the content
      extractedFacts = [{
        fact: dimensionXContent.slice(0, 500),
        page_number: 1,
        category: "extracted_content",
        confidence_score: 0.8
      }];
    }

    console.log(`DIMENSION X: Extracted ${extractedFacts.length} facts`);

    // ============ SAVE FACTS TO DATABASE ============
    console.log("Saving facts to knowledge_base...");
    
    const factsToInsert = extractedFacts.map(fact => ({
      user_id: userId,
      project_id: projectId || null,
      pdf_name: pdfFile.name,
      fact: fact.fact,
      page_number: fact.page_number || null,
      line_reference: fact.line_reference || null,
      category: fact.category || null,
      confidence_score: fact.confidence_score || 0.95,
    }));

    let savedFactsCount = 0;

    if (factsToInsert.length > 0) {
      try {
        console.log("Attempting to insert", factsToInsert.length, "facts...");
        
        const { data: insertedData, error: insertError, status } = await supabase
          .from("knowledge_base")
          .insert(factsToInsert)
          .select();

        console.log("Supabase response status:", status);

        if (insertError) {
          console.error("DATABASE_SAVE_FAILURE:", {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
          });
        } else if (status === 201 || status === 200) {
          savedFactsCount = insertedData?.length || 0;
          console.log(`SUCCESS: Saved ${savedFactsCount} facts to knowledge_base`);
        }
      } catch (dbError) {
        console.error("DATABASE_SAVE_FAILURE: Exception caught:", dbError);
      }
    }

    console.log("DIMENSION Y: Generating narrative...");

    // ============ DIMENSION Y: Generate Narrative ============
    // Only pass summarized facts, not full PDF content - memory optimization
    const factsSummary = extractedFacts.slice(0, 20).map((f, i) => ({
      id: i + 1,
      fact: f.fact.slice(0, 300), // Limit each fact to 300 chars
      category: f.category
    }));

    let storyboard: TesseractResponse["storyboard"] = [];
    let dimensionYAttempts = 0;
    
    while (dimensionYAttempts < MAX_ITERATIONS) {
      dimensionYAttempts++;
      console.log(`Dimension Y attempt ${dimensionYAttempts}/${MAX_ITERATIONS}`);
      
      try {
        const dimensionYResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { 
                role: "system", 
                content: PROMPT_DIMENSION_Y 
              },
              { 
                role: "user", 
                content: `Create a Kurzgesagt-style video script based on these ${factsSummary.length} key facts:\n\n${JSON.stringify(factsSummary, null, 2)}\n\nRespond with a JSON object containing a "storyboard" array. Each storyboard item should have: timestamp, visual_description, narration.`
              }
            ],
          }),
        });

        if (dimensionYResponse.ok) {
          const dimensionYData = await dimensionYResponse.json();
          const dimensionYContent = dimensionYData.choices?.[0]?.message?.content || "{}";

          try {
            const jsonMatch = dimensionYContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              storyboard = parsed.storyboard || [];
              if (storyboard.length > 0) break; // Success with content
            }
          } catch {
            console.log("Dimension Y parse failed, retrying...");
          }
        } else {
          console.error(`Dimension Y attempt ${dimensionYAttempts} failed`);
        }
      } catch (fetchError) {
        console.error(`Dimension Y fetch error attempt ${dimensionYAttempts}:`, fetchError);
      }
      
      if (dimensionYAttempts >= MAX_ITERATIONS) {
        console.log("Dimension Y: Max iterations reached, using fallback");
        storyboard = [{
          timestamp: "0:00",
          visual_description: "Opening scene with abstract visualization",
          narration: `This video explores ${extractedFacts.length} key concepts from the document.`
        }];
      }
    }

    console.log("DIMENSION Z: Auditing for scientific accuracy...");

    // ============ DIMENSION Z: Audit ============
    // Only pass storyboard and top facts for auditing - memory optimization
    const auditPayload = {
      facts: factsSummary.slice(0, 10),
      scenes: storyboard.slice(0, 10).map(s => ({
        timestamp: s.timestamp,
        narration: s.narration.slice(0, 200)
      }))
    };

    let analogies: TesseractResponse["analogies"] = [];
    let dimensionZAttempts = 0;
    
    while (dimensionZAttempts < MAX_ITERATIONS) {
      dimensionZAttempts++;
      console.log(`Dimension Z attempt ${dimensionZAttempts}/${MAX_ITERATIONS}`);
      
      try {
        const dimensionZResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { 
                role: "system", 
                content: PROMPT_DIMENSION_Z 
              },
              { 
                role: "user", 
                content: `Audit this narrative for scientific accuracy.\n\nFACTS:\n${JSON.stringify(auditPayload.facts)}\n\nSCENES:\n${JSON.stringify(auditPayload.scenes)}\n\nRespond with a JSON object containing an "analogies" array. Each analogy should have: concept, simple_explanation, scientific_proof, risk_level (safe/moderate/risky).`
              }
            ],
          }),
        });

        if (dimensionZResponse.ok) {
          const dimensionZData = await dimensionZResponse.json();
          const dimensionZContent = dimensionZData.choices?.[0]?.message?.content || "{}";

          try {
            const jsonMatch = dimensionZContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              analogies = parsed.analogies || [];
              break; // Success
            }
          } catch {
            console.log("Dimension Z parse failed, retrying...");
          }
        } else {
          console.error(`Dimension Z attempt ${dimensionZAttempts} failed`);
        }
      } catch (fetchError) {
        console.error(`Dimension Z fetch error attempt ${dimensionZAttempts}:`, fetchError);
      }
      
      if (dimensionZAttempts >= MAX_ITERATIONS) {
        console.log("Dimension Z: Max iterations reached, proceeding without analogies");
      }
    }

    // Calculate ADHD-optimized focus score
    const avgSegmentLength = storyboard.length > 0 
      ? storyboard.reduce((acc, s) => acc + s.narration.length, 0) / storyboard.length 
      : 100;
    
    const focusScore = Math.max(0, Math.min(100, 100 - Math.abs(avgSegmentLength - 150) / 3));

    const response: TesseractResponse = {
      storyboard,
      analogies,
      focus_score: Math.round(focusScore),
      facts_extracted: extractedFacts.length,
    };

    console.log("Tesseract Pipeline complete:", {
      facts: extractedFacts.length,
      storyboard_segments: storyboard.length,
      analogies: analogies.length,
      focus_score: response.focus_score,
      db_saved: savedFactsCount
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Tesseract Pipeline error:", errorMessage);
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      storyboard: [],
      analogies: [],
      focus_score: 0,
      facts_extracted: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
