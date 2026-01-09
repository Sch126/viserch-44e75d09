import { DashboardHeader } from '@/components/DashboardHeader';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { AIChatSidebar } from '@/components/AIChatSidebar';
import { LabNotebook, LabEntry } from '@/components/LabNotebook';
import { PipelineStage } from '@/components/StatusTracker';
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Clear new entry glow after 2 seconds
  useEffect(() => {
    if (newEntryId) {
      const timer = setTimeout(() => {
        setNewEntryId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [newEntryId]);

  // Simulate pipeline processing
  const handleUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    toast({
      title: "Processing Started",
      description: `Analyzing "${file.name}"...`,
    });

    const stages: PipelineStage[] = [
      'knowledge-architect',
      'metaphorical-director',
      'manim-engineer',
      'adhd-critic',
    ];

    for (const stage of stages) {
      setPipelineStage(stage);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate ADHD Critic flagging an issue 50% of the time
      if (stage === 'adhd-critic' && Math.random() > 0.5) {
        setIsRefining(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsRefining(false);
      }
    }

    setPipelineStage('complete');
    setIsProcessing(false);
    
    toast({
      title: "Processing Complete",
      description: "Your video is ready to view!",
    });
  }, [toast]);

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
    <div className="min-h-screen bg-parchment p-6">
      <div className="max-w-[1800px] mx-auto h-[calc(100vh-48px)] flex flex-col">
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
                <ProjectSidebar 
                  onUpload={handleUpload}
                  isProcessing={isProcessing}
                  pipelineStage={pipelineStage}
                  isRefining={isRefining}
                  isVideoPlaying={isVideoPlaying}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <VideoPlayer 
              onCircleCapture={handleCircleCapture}
              isPlaying={isVideoPlaying}
              onPlayStateChange={setIsVideoPlaying}
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
                  <LabNotebook 
                    entries={labEntries}
                    onDeleteEntry={handleDeleteEntry}
                    isExpanded={isLabExpanded}
                    onToggleExpand={() => setIsLabExpanded(!isLabExpanded)}
                    isVideoPlaying={isVideoPlaying}
                    newEntryId={newEntryId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <AIChatSidebar isVideoPaused={!isVideoPlaying} />
        </div>
      </div>
    </div>
  );
};

export default Index;
