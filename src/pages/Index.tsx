import { DashboardHeader } from '@/components/DashboardHeader';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { AIChatSidebar } from '@/components/AIChatSidebar';
import { LabNotebook, LabEntry } from '@/components/LabNotebook';
import { PipelineStage } from '@/components/StatusTracker';
import { RenderState } from '@/components/RenderingStatus';
import { LivingBackground } from '@/components/LivingBackground';
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCinematicFocus } from '@/hooks/useCinematicFocus';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

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
  render_job_id?: string;
  render_status?: string;
  error?: string;
}
const Index = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [isRefining, setIsRefining] = useState(false);
  const [labEntries, setLabEntries] = useState<LabEntry[]>([]);
  const [isLabExpanded, setIsLabExpanded] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [newEntryId, setNewEntryId] = useState<string | null>(null);
  
  // Render state tracking
  const [renderState, setRenderState] = useState<RenderState>('idle');
  const [renderProgress, setRenderProgress] = useState(0);
  const [healingAttempt, setHealingAttempt] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [renderError, setRenderError] = useState<string | undefined>();
  
  // Cinematic focus - dims other panels when user is actively engaged
  const { isActive: isCinematicActive, triggerFocus: triggerCinematicFocus } = useCinematicFocus(3000);
  // Clear new entry glow after 2 seconds
  useEffect(() => {
    if (newEntryId) {
      const timer = setTimeout(() => {
        setNewEntryId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [newEntryId]);

  // Tesseract Agent Pipeline processing
  const handleUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    toast({
      title: "Processing Started",
      description: `Analyzing "${file.name}" with Tesseract Pipeline...`,
    });

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to process documents.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // Stage 1: Knowledge Architect (Dimension X)
      setPipelineStage('knowledge-architect');
      
      // Create FormData for the edge function
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('user_id', user.id);
      
      // Call the analyze-multidimensional edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-multidimensional`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      // Update stages as we process
      setPipelineStage('metaphorical-director');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPipelineStage('manim-engineer');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPipelineStage('adhd-critic');

      const result: TesseractResponse = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Check if any analogies are risky
      const riskyAnalogies = result.analogies?.filter(a => a.risk_level === 'risky') || [];
      if (riskyAnalogies.length > 0) {
        setIsRefining(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsRefining(false);
      }

      setPipelineStage('complete');
      
      // Handle render state from response
      if (result.render_status) {
        if (result.render_status === 'queued' || result.render_status === 'rendering') {
          setRenderState('compiling');
          // Simulate progress for now (in production, poll for status)
          simulateRenderProgress();
        } else if (result.render_status === 'error') {
          setRenderState('error');
          setRenderError('Render server encountered an error');
        }
      }
      
      toast({
        title: "Processing Complete",
        description: `Extracted ${result.facts_extracted} facts. Focus Score: ${result.focus_score}/100`,
      });

      console.log("Tesseract Pipeline Result:", result);

    } catch (error) {
      console.error("Pipeline error:", error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      setPipelineStage('idle');
      setRenderState('error');
      setRenderError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  // Simulate render progress (in production, poll the render server)
  const simulateRenderProgress = useCallback(() => {
    setRenderState('rendering');
    setRenderProgress(0);
    
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRenderState('complete');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);
  }, []);

  const handleCircleCapture = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    const newEntry: LabEntry = {
      id: crypto.randomUUID(),
      type: 'diagram',
      timestamp: new Date(),
      content: `Captured area at position (${Math.round(bounds.x)}, ${Math.round(bounds.y)})`,
      bounds,
      videoTimestamp: '12:34',
    };

    setLabEntries(prev => [newEntry, ...prev]);
    setNewEntryId(newEntry.id);

    // Auto-add AI explanation
    setTimeout(() => {
      const explanationEntry: LabEntry = {
        id: crypto.randomUUID(),
        type: 'explanation',
        timestamp: new Date(),
        content: 'This diagram shows the wave-particle duality concept. The circled area highlights how quantum particles exhibit both wave and particle properties depending on observation.',
        videoTimestamp: '12:34',
      };
      setLabEntries(prev => [explanationEntry, ...prev]);
      setNewEntryId(explanationEntry.id);
    }, 1000);

    toast({
      title: "Diagram Saved",
      description: "Added to your Lab Notebook with AI explanation.",
    });
  }, [toast]);

  const handleDeleteEntry = useCallback((id: string) => {
    setLabEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const sidebarVariants = {
    visible: { 
      width: 'auto',
      opacity: 1,
      marginRight: '1rem',
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }
    },
    hidden: { 
      width: 0,
      opacity: 0,
      marginRight: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }
    }
  };

  const labNotebookVariants = {
    visible: { 
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }
    },
    hidden: { 
      height: 0,
      opacity: 0,
      marginTop: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-parchment p-6 scrollbar-ghost-gold magnetic-container relative">
      {/* Living Background - slow mesh gradients */}
      <LivingBackground />
      
      <div className="max-w-[1800px] mx-auto min-h-full flex flex-col relative z-10">
        <DashboardHeader 
          isFocusMode={isFocusMode}
          onFocusModeToggle={() => setIsFocusMode(!isFocusMode)}
        />
        
        {/* Main Bento Box Layout */}
        <div className="flex-1 flex gap-4 min-h-0">
          <AnimatePresence>
            {!isFocusMode && (
              <motion.div
                initial="visible"
                animate="visible"
                exit="hidden"
                variants={sidebarVariants}
                className="overflow-hidden"
              >
                <motion.div
                  animate={{ opacity: isCinematicActive ? 0.3 : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <ProjectSidebar 
                    onUpload={handleUpload}
                    isProcessing={isProcessing}
                    pipelineStage={pipelineStage}
                    isRefining={isRefining}
                    isVideoPlaying={isVideoPlaying}
                    renderState={renderState}
                    renderProgress={Math.round(renderProgress)}
                    healingAttempt={healingAttempt}
                    videoUrl={videoUrl}
                    renderError={renderError}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <VideoPlayer 
              onCircleCapture={handleCircleCapture}
              isPlaying={isVideoPlaying}
              onPlayStateChange={setIsVideoPlaying}
              onDrawingStart={triggerCinematicFocus}
            />
            <AnimatePresence>
              {!isFocusMode && (
                <motion.div
                  initial="visible"
                  animate="visible"
                  exit="hidden"
                  variants={labNotebookVariants}
                  className="overflow-hidden"
                >
                  <motion.div
                    animate={{ opacity: isCinematicActive ? 0.3 : 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <LabNotebook 
                      entries={labEntries}
                      onDeleteEntry={handleDeleteEntry}
                      isExpanded={isLabExpanded}
                      onToggleExpand={() => setIsLabExpanded(!isLabExpanded)}
                      isVideoPlaying={isVideoPlaying}
                      newEntryId={newEntryId}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <AIChatSidebar 
            isVideoPaused={!isVideoPlaying} 
            onTypingStart={triggerCinematicFocus}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
