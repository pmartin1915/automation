import { useState } from 'react';
import { mockProjects } from '@/data/mockData';
import Sidebar from '@/components/Sidebar';
import ProjectDetail from '@/components/ProjectDetail';
import type { Project } from '@/types';

function App() {
  const [selectedProject, setSelectedProject] = useState<Project>(mockProjects[0]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-10 flex items-center px-6 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">🤖 Claude Automation Platform</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <Sidebar
          projects={mockProjects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <ProjectDetail project={selectedProject} />
        </main>
      </div>
    </div>
  );
}

export default App;
