import { DashboardHeader } from '@/components/DashboardHeader';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { AIChatSidebar } from '@/components/AIChatSidebar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto h-[calc(100vh-48px)] flex flex-col">
        <DashboardHeader />
        
        {/* Bento Box Layout */}
        <div className="flex-1 flex gap-4 min-h-0">
          <ProjectSidebar />
          <VideoPlayer />
          <AIChatSidebar />
        </div>
      </div>
    </div>
  );
};

export default Index;
