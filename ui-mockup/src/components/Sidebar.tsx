import type { Project } from '@/types';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import AddProjectModal from '@/components/modals/AddProjectModal';

interface SidebarProps {
  projects: Project[];
  selectedProject: Project;
  onSelectProject: (project: Project) => void;
}

export default function Sidebar({ projects, selectedProject, onSelectProject }: SidebarProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Projects
        </h2>

        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isSelected={selectedProject.id === project.id}
              onClick={() => onSelectProject(project)}
            />
          ))}
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          variant="outline"
          className="w-full mt-4"
        >
          + Add Project
        </Button>
      </div>

      <AddProjectModal open={showAddModal} onOpenChange={setShowAddModal} />
    </aside>
  );
}
