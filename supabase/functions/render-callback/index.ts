import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RenderCallbackPayload {
  job_id: string;
  status: "complete" | "error";
  video_url?: string;
  video_data?: string; // Base64 encoded video if uploading directly
  pdf_name: string;
  user_id: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const payload: RenderCallbackPayload = await req.json();
    
    console.log("Render callback received:", {
      job_id: payload.job_id,
      status: payload.status,
      pdf_name: payload.pdf_name,
      user_id: payload.user_id,
      has_video_url: !!payload.video_url,
      has_video_data: !!payload.video_data
    });

    let finalVideoUrl = payload.video_url;

    // If video data is provided instead of URL, upload to storage
    if (payload.status === "complete" && payload.video_data && !payload.video_url) {
      console.log("Uploading video to Supabase storage...");
      
      // Decode base64 video data
      const videoBytes = Uint8Array.from(atob(payload.video_data), c => c.charCodeAt(0));
      
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedPdfName = payload.pdf_name.replace(/[^a-zA-Z0-9]/g, '_');
      const videoPath = `${payload.user_id}/${sanitizedPdfName}_${timestamp}.mp4`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoBytes, {
          contentType: 'video/mp4',
          upsert: true
        });

      if (uploadError) {
        console.error("Video upload failed:", uploadError);
        throw new Error(`Video upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(videoPath);

      finalVideoUrl = urlData.publicUrl;
      console.log("Video uploaded successfully:", finalVideoUrl);
    }

    // Update knowledge_base with video URL and status
    const updateData: Record<string, any> = {
      render_status: payload.status
    };

    if (payload.status === "complete" && finalVideoUrl) {
      updateData.video_url = finalVideoUrl;
    }

    if (payload.status === "error" && payload.error) {
      console.error("Render error:", payload.error);
    }

    // Update all entries for this PDF and user
    const { data: updateResult, error: updateError } = await supabase
      .from("knowledge_base")
      .update(updateData)
      .eq('pdf_name', payload.pdf_name)
      .eq('user_id', payload.user_id)
      .eq('render_status', 'rendering')
      .select('id');

    if (updateError) {
      console.error("Failed to update knowledge_base:", updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`Updated ${updateResult?.length || 0} knowledge_base entries`);

    return new Response(JSON.stringify({
      success: true,
      updated_count: updateResult?.length || 0,
      video_url: finalVideoUrl
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Render callback error:", errorMessage);
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});