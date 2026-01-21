import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============ TYPE DEFINITIONS ============

interface PageResult {
  page: number;
  concepts: Array<{
    term: string;
    definition: string;
    beginner_analogy: string;
    difficulty: string;
  }>;
  facts: Array<{
    fact: string;
    category: string;
    confidence_score: number;
  }>;
  animation_code: string;
  voiceover: string;
  status: "success" | "fallback";
  error?: string;
}

interface ContextPacket {
  paper_title: string;
  main_goal: string;
  themes: string[];
  key_terminology: string[];
  target_audience: string;
  total_pages: number;
}

interface SwarmResponse {
  storyboard: PageResult[];
  context: ContextPacket;
  focus_score: number;
  facts_extracted: number;
  pages_processed: number;
  pages_failed: number;
}

// Maximum iterations for any agent retry loops
const MAX_AGENT_RETRIES = 3;
const MAX_CONCURRENT_PAGES = 5; // Process 5 pages at a time to avoid rate limits

// ============ UTILITY FUNCTIONS ============

// Memory-safe base64 encoding for large files
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = "";
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
}

// Chunk array for batched parallel processing
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Safe JSON parsing with fallback
function safeParseJSON(content: string, fallback: any = null): any {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
  } catch (e) {
    console.error("JSON parse error:", e);
  }
  return fallback;
}

// ============ AI AGENT FUNCTIONS ============

async function callAI(
  apiKey: string,
  systemPrompt: string,
  userContent: string | any[],
  retries: number = MAX_AGENT_RETRIES
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: typeof userContent === "string" 
                ? userContent 
                : userContent
            }
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
      } else {
        const errorText = await response.text();
        console.error(`AI call attempt ${attempt} failed:`, errorText);
      }
    } catch (error) {
      console.error(`AI call attempt ${attempt} error:`, error);
    }
    
    if (attempt < retries) {
      await new Promise(r => setTimeout(r, 1000 * attempt)); // Exponential backoff
    }
  }
  return "";
}

// ============ AGENT 0: GLOBAL CONTEXT GENERATOR ============

async function generateGlobalContext(
  apiKey: string,
  pdfBase64: string,
  pdfName: string
): Promise<ContextPacket> {
  console.log("AGENT 0 (Global): Generating context packet...");
  
  const systemPrompt = `You are the Global Context Analyzer. Your job is to perform a quick scan of an academic document and extract high-level metadata that will guide all subsequent page-level analysis.

You MUST respond with a JSON object containing:
{
  "paper_title": "The exact title of the paper",
  "main_goal": "One sentence describing what this paper aims to achieve",
  "themes": ["theme1", "theme2", "theme3"],
  "key_terminology": ["term1", "term2", "term3", "term4", "term5"],
  "target_audience": "Who would benefit from understanding this paper"
}`;

  const userContent = [
    {
      type: "text",
      text: `Analyze this PDF and extract the global context. PDF Name: ${pdfName}`
    },
    {
      type: "file",
      file: {
        filename: pdfName,
        file_data: `data:application/pdf;base64,${pdfBase64}`
      }
    }
  ];

  const response = await callAI(apiKey, systemPrompt, userContent);
  const parsed = safeParseJSON(response, {});

  return {
    paper_title: parsed.paper_title || pdfName.replace(".pdf", ""),
    main_goal: parsed.main_goal || "Explore and explain the concepts in this document",
    themes: parsed.themes || ["academic", "research"],
    key_terminology: parsed.key_terminology || [],
    target_audience: parsed.target_audience || "Students and researchers",
    total_pages: 0 // Will be updated after page extraction
  };
}

// ============ AGENT 0: UNIVERSAL TODDLER (PER-PAGE) ============

async function runUniversalToddlerScan(
  apiKey: string,
  pageContent: string,
  pageNumber: number,
  context: ContextPacket
): Promise<Array<{term: string; definition: string; beginner_analogy: string; difficulty: string}>> {
  console.log(`AGENT 0 (Toddler): Scanning page ${pageNumber} for confusing concepts...`);

  const systemPrompt = `You are the Universal Toddler - an AI that identifies concepts a beginner wouldn't understand.

CONTEXT: You are analyzing page ${pageNumber} of "${context.paper_title}".
Paper Goal: ${context.main_goal}
Key Themes: ${context.themes.join(", ")}

For each complex term or concept, provide a simple analogy that a 5-year-old could understand.

Respond with JSON:
{
  "concepts": [
    {
      "term": "complex term here",
      "definition": "technical definition",
      "beginner_analogy": "Simple analogy like: 'It's like when you...'",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

  const response = await callAI(apiKey, systemPrompt, `Analyze this page content and identify confusing concepts:\n\n${pageContent.slice(0, 3000)}`);
  const parsed = safeParseJSON(response, { concepts: [] });
  
  return parsed.concepts || [];
}

// ============ AGENT 1: FACT EXTRACTOR (PER-PAGE) ============

async function extractPageFacts(
  apiKey: string,
  pageContent: string,
  pageNumber: number,
  context: ContextPacket
): Promise<Array<{fact: string; category: string; confidence_score: number}>> {
  console.log(`AGENT 1 (Facts): Extracting facts from page ${pageNumber}...`);

  const systemPrompt = `You are the Fact Extractor for page ${pageNumber} of "${context.paper_title}".
Paper Goal: ${context.main_goal}

Extract all factual claims, definitions, equations, and data points from this page.

Respond with JSON:
{
  "facts": [
    {
      "fact": "The exact factual claim or data point",
      "category": "definition|equation|data|claim|method|result",
      "confidence_score": 0.95
    }
  ]
}`;

  const response = await callAI(apiKey, systemPrompt, `Extract facts from this page:\n\n${pageContent.slice(0, 4000)}`);
  const parsed = safeParseJSON(response, { facts: [] });
  
  return (parsed.facts || parsed.extracted_facts || []).map((f: any) => ({
    fact: f.fact || f.claim || f.content || JSON.stringify(f),
    category: f.category || f.type || "general",
    confidence_score: f.confidence_score || f.confidence || 0.9
  }));
}

// ============ AGENT 2: NARRATIVE GENERATOR (PER-PAGE) ============

async function generatePageNarrative(
  apiKey: string,
  concepts: any[],
  facts: any[],
  pageNumber: number,
  context: ContextPacket
): Promise<string> {
  console.log(`AGENT 2 (Narrative): Generating voiceover for page ${pageNumber}...`);

  const systemPrompt = `You are the Narrative Director for page ${pageNumber} of "${context.paper_title}".
Paper Goal: ${context.main_goal}
Target Audience: ${context.target_audience}

Write a Kurzgesagt-style voiceover script for this page. Make it engaging, educational, and use the beginner analogies provided.

Keep the voiceover between 30-60 seconds when read aloud (roughly 75-150 words).

Respond with JSON:
{
  "voiceover": "The script text here..."
}`;

  const payload = {
    concepts: concepts.slice(0, 5),
    facts: facts.slice(0, 8)
  };

  const response = await callAI(apiKey, systemPrompt, `Create a voiceover for this page:\n\n${JSON.stringify(payload, null, 2)}`);
  const parsed = safeParseJSON(response, { voiceover: "" });
  
  return parsed.voiceover || `Page ${pageNumber} explores concepts from ${context.paper_title}.`;
}

// ============ AGENT 3: VISUAL CODE GENERATOR (PER-PAGE) ============

async function generateAnimationCode(
  apiKey: string,
  concepts: any[],
  facts: any[],
  pageNumber: number,
  context: ContextPacket
): Promise<string> {
  console.log(`AGENT 3 (Visual): Generating animation code for page ${pageNumber}...`);

  const systemPrompt = `You are the Visual Code Generator for page ${pageNumber} of "${context.paper_title}".

Generate procedural animation code that visually represents the concepts and formulas from this page.

You MUST output a Remotion/React component that can be rendered as an animation. Use SVG elements for shapes and framer-motion style animations.

Example output format:
\`\`\`tsx
// Page ${pageNumber} Animation Component
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const Page${pageNumber}Scene: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Animation logic here
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const scale = interpolate(frame, [0, 30], [0.5, 1]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Visual elements representing concepts */}
      <svg viewBox="0 0 800 600">
        {/* Animated shapes here */}
      </svg>
    </AbsoluteFill>
  );
};
\`\`\`

Respond with JSON:
{
  "animation_code": "// The complete component code here"
}`;

  const payload = {
    page: pageNumber,
    title: context.paper_title,
    concepts: concepts.slice(0, 3).map(c => ({ term: c.term, analogy: c.beginner_analogy })),
    facts: facts.slice(0, 3).map(f => f.fact)
  };

  const response = await callAI(apiKey, systemPrompt, `Generate animation code for:\n\n${JSON.stringify(payload, null, 2)}`);
  const parsed = safeParseJSON(response, { animation_code: "" });
  
  // Extract code from markdown code blocks if present
  let code = parsed.animation_code || "";
  const codeBlockMatch = code.match(/```(?:tsx|jsx|javascript|js)?\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    code = codeBlockMatch[1].trim();
  }
  
  // Fallback animation code if none generated
  if (!code || code.length < 50) {
    code = `// Page ${pageNumber} Animation - Fallback
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const Page${pageNumber}Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  
  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#0a0a0a', 
      justifyContent: 'center', 
      alignItems: 'center',
      color: 'white',
      fontSize: 48 
    }}>
      <div style={{ opacity }}>
        Page ${pageNumber}: ${context.paper_title.slice(0, 50)}
      </div>
    </AbsoluteFill>
  );
};`;
  }
  
  return code;
}

// ============ PAGE WORKER: PROCESSES SINGLE PAGE ============

async function processPage(
  apiKey: string,
  pageContent: string,
  pageNumber: number,
  context: ContextPacket
): Promise<PageResult> {
  console.log(`\n========== PROCESSING PAGE ${pageNumber} ==========`);
  
  try {
    // Step 1: Run Universal Toddler scan
    const concepts = await runUniversalToddlerScan(apiKey, pageContent, pageNumber, context);
    console.log(`Page ${pageNumber}: Found ${concepts.length} concepts`);
    
    // Step 2: Extract facts
    const facts = await extractPageFacts(apiKey, pageContent, pageNumber, context);
    console.log(`Page ${pageNumber}: Extracted ${facts.length} facts`);
    
    // Step 3 & 4: Run narrative and animation in parallel
    const [voiceover, animation_code] = await Promise.all([
      generatePageNarrative(apiKey, concepts, facts, pageNumber, context),
      generateAnimationCode(apiKey, concepts, facts, pageNumber, context)
    ]);
    
    console.log(`Page ${pageNumber}: Generated voiceover (${voiceover.length} chars) and animation code (${animation_code.length} chars)`);
    
    return {
      page: pageNumber,
      concepts,
      facts,
      animation_code,
      voiceover,
      status: "success"
    };
    
  } catch (error) {
    console.error(`Page ${pageNumber} FAILED:`, error);
    
    // Return fallback node
    return {
      page: pageNumber,
      concepts: [],
      facts: [],
      animation_code: `// Page ${pageNumber} - Fallback (processing error)
import { AbsoluteFill } from 'remotion';
export const Page${pageNumber}Scene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#1a1a1a', color: 'white', justifyContent: 'center', alignItems: 'center' }}>
    <div>Page ${pageNumber} content could not be processed</div>
  </AbsoluteFill>
);`,
      voiceover: `Page ${pageNumber} of this document is still being analyzed. Let's continue with the next section.`,
      status: "fallback",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// ============ PDF PAGE EXTRACTOR (SIMULATED) ============

async function extractPDFPages(
  apiKey: string,
  pdfBase64: string,
  pdfName: string
): Promise<string[]> {
  console.log("Extracting page content from PDF...");
  
  // Use AI to extract page-by-page content
  const systemPrompt = `You are a PDF content extractor. Analyze this PDF and extract the text content of each page separately.

Respond with JSON:
{
  "pages": [
    { "page": 1, "content": "Full text content of page 1..." },
    { "page": 2, "content": "Full text content of page 2..." }
  ]
}

Extract up to 20 pages. Include all text, equations (in LaTeX format), tables, and figure captions.`;

  const userContent = [
    {
      type: "text",
      text: `Extract the text content from each page of this PDF: ${pdfName}`
    },
    {
      type: "file",
      file: {
        filename: pdfName,
        file_data: `data:application/pdf;base64,${pdfBase64}`
      }
    }
  ];

  const response = await callAI(apiKey, systemPrompt, userContent);
  const parsed = safeParseJSON(response, { pages: [] });
  
  if (parsed.pages && parsed.pages.length > 0) {
    console.log(`Extracted ${parsed.pages.length} pages from PDF`);
    return parsed.pages.map((p: any) => p.content || `Page ${p.page} content`);
  }
  
  // Fallback: treat entire PDF as single page
  console.log("Could not extract individual pages, treating as single document");
  return ["Full document content extracted as single page"];
}

// ============ MAIN SWARM ORCHESTRATOR ============

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const pdfFile = formData.get("pdf") as File;
    const userId = formData.get("user_id") as string;
    const projectId = formData.get("project_id") as string | null;

    if (!pdfFile) throw new Error("No PDF file provided");
    if (!userId) throw new Error("No user_id provided");

    console.log(`\n====== SWARM ORCHESTRATOR STARTING ======`);
    console.log(`PDF: ${pdfFile.name}`);
    console.log(`User: ${userId}, Project: ${projectId || "none"}`);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Missing Supabase configuration");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Read and encode PDF
    console.log("Reading PDF file...");
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfBase64 = arrayBufferToBase64(pdfBytes);
    console.log(`PDF size: ${pdfBytes.byteLength} bytes, Base64: ${pdfBase64.length} chars`);

    // ============ PHASE 1: GLOBAL CONTEXT ============
    console.log("\n====== PHASE 1: GLOBAL CONTEXT ======");
    const context = await generateGlobalContext(LOVABLE_API_KEY, pdfBase64, pdfFile.name);
    console.log("Context Packet:", JSON.stringify(context, null, 2));

    // ============ PHASE 2: EXTRACT PAGES ============
    console.log("\n====== PHASE 2: EXTRACT PAGES ======");
    const pageContents = await extractPDFPages(LOVABLE_API_KEY, pdfBase64, pdfFile.name);
    context.total_pages = pageContents.length;
    console.log(`Total pages to process: ${pageContents.length}`);

    // ============ PHASE 3: PARALLEL PAGE PROCESSING ============
    console.log("\n====== PHASE 3: PARALLEL PAGE PROCESSING ======");
    const allPageResults: PageResult[] = [];
    const pageChunks = chunkArray(
      pageContents.map((content, idx) => ({ content, pageNumber: idx + 1 })),
      MAX_CONCURRENT_PAGES
    );

    for (const chunk of pageChunks) {
      console.log(`Processing batch of ${chunk.length} pages...`);
      const chunkResults = await Promise.all(
        chunk.map(({ content, pageNumber }) =>
          processPage(LOVABLE_API_KEY, content, pageNumber, context)
        )
      );
      allPageResults.push(...chunkResults);
    }

    // Sort by page number
    allPageResults.sort((a, b) => a.page - b.page);

    console.log("\n====== PHASE 4: SYNTHESIS & STORAGE ======");
    console.log("GENERATED STORYBOARD:", JSON.stringify(allPageResults.slice(0, 2), null, 2));

    // Calculate stats
    const successCount = allPageResults.filter(r => r.status === "success").length;
    const failCount = allPageResults.filter(r => r.status === "fallback").length;
    const totalFacts = allPageResults.reduce((sum, r) => sum + r.facts.length, 0);
    const totalConcepts = allPageResults.reduce((sum, r) => sum + r.concepts.length, 0);

    console.log(`Pages processed: ${successCount} success, ${failCount} fallback`);
    console.log(`Total facts: ${totalFacts}, Total concepts: ${totalConcepts}`);

    // Prepare storyboard JSON
    const storyboardJson = {
      context,
      pages: allPageResults.map(r => ({
        page: r.page,
        concepts: r.concepts,
        animation_code: r.animation_code,
        voiceover: r.voiceover,
        status: r.status
      }))
    };

    // Save all facts to database
    const factsToInsert = allPageResults.flatMap(pageResult =>
      pageResult.facts.map(fact => ({
        user_id: userId,
        project_id: projectId || null,
        pdf_name: pdfFile.name,
        fact: fact.fact,
        page_number: pageResult.page,
        line_reference: null,
        category: fact.category,
        confidence_score: fact.confidence_score,
        storyboard_json: storyboardJson,
      }))
    );

    let savedFactsCount = 0;
    if (factsToInsert.length > 0) {
      console.log(`Inserting ${factsToInsert.length} facts to knowledge_base...`);
      const { data: insertedData, error: insertError } = await supabase
        .from("knowledge_base")
        .insert(factsToInsert)
        .select();

      if (insertError) {
        console.error("DATABASE_SAVE_FAILURE:", insertError);
      } else {
        savedFactsCount = insertedData?.length || 0;
        console.log(`SUCCESS: Saved ${savedFactsCount} facts with storyboard`);
      }
    }

    // Calculate focus score (ADHD-optimized based on voiceover lengths)
    const avgVoiceoverLength = allPageResults.length > 0
      ? allPageResults.reduce((sum, r) => sum + r.voiceover.length, 0) / allPageResults.length
      : 100;
    const focusScore = Math.max(0, Math.min(100, 100 - Math.abs(avgVoiceoverLength - 200) / 4));

    const response: SwarmResponse = {
      storyboard: allPageResults,
      context,
      focus_score: Math.round(focusScore),
      facts_extracted: totalFacts,
      pages_processed: successCount,
      pages_failed: failCount
    };

    console.log("\n====== SWARM COMPLETE ======");
    console.log({
      facts: totalFacts,
      concepts: totalConcepts,
      pages_success: successCount,
      pages_fallback: failCount,
      db_saved: savedFactsCount,
      focus_score: response.focus_score
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("SWARM ORCHESTRATOR ERROR:", errorMessage);
    
    return new Response(JSON.stringify({
      error: errorMessage,
      storyboard: [],
      context: null,
      focus_score: 0,
      facts_extracted: 0,
      pages_processed: 0,
      pages_failed: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
