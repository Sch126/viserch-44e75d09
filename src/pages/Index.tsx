import { DashboardHeader } from '@/components/DashboardHeader';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { AIChatSidebar } from '@/components/AIChatSidebar';
import { LabNotebook, LabEntry } from '@/components/LabNotebook';
import { PipelineStage } from '@/components/StatusTracker';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [isRefining, setIsRefining] = useState(false);
  const [labEntries, setLabEntries] = useState<LabEntry[]>([]);
  const [isLabExpanded, setIsLabExpanded] = useState(true);

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
    }, 1000);

    toast({
      title: "Diagram Saved",
      description: "Added to your Lab Notebook with AI explanation.",
    });
  }, [toast]);

  const handleDeleteEntry = useCallback((id: string) => {
    setLabEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto h-[calc(100vh-48px)] flex flex-col">
        <DashboardHeader />
        
        {/* Main Bento Box Layout */}
        <div className="flex-1 flex gap-4 min-h-0">
          <ProjectSidebar 
            onUpload={handleUpload}
            isProcessing={isProcessing}
            pipelineStage={pipelineStage}
            isRefining={isRefining}
          />
          
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <VideoPlayer onCircleCapture={handleCircleCapture} />
            <LabNotebook 
              entries={labEntries}
              onDeleteEntry={handleDeleteEntry}
              isExpanded={isLabExpanded}
              onToggleExpand={() => setIsLabExpanded(!isLabExpanded)}
            />
          </div>
          
          <AIChatSidebar />
        </div>
      </div>
    </div>
  );
};

export default Index;
