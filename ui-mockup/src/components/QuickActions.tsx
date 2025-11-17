import { Button } from '@/components/ui/button';
import { TestTube, Rocket, FileText, GitBranch } from 'lucide-react';
import { useState } from 'react';
import LaunchClaudeModal from '@/components/modals/LaunchClaudeModal';
import type { Project } from '@/types';

interface QuickActionsProps {
  project: Project;
}

export default function QuickActions({ project }: QuickActionsProps) {
  const [showLaunchModal, setShowLaunchModal] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="default" className="flex items-center gap-2">
        <TestTube className="w-4 h-4" />
        Run Tests
      </Button>

      <Button
        variant="default"
        className="flex items-center gap-2"
        onClick={() => setShowLaunchModal(true)}
      >
        <Rocket className="w-4 h-4" />
        Launch Claude Code
      </Button>

      <Button variant="outline" className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Commit & Push
      </Button>

      <Button variant="outline" className="flex items-center gap-2">
        <GitBranch className="w-4 h-4" />
        Create Branch
      </Button>

      <LaunchClaudeModal
        project={project}
        open={showLaunchModal}
        onOpenChange={setShowLaunchModal}
      />
    </div>
  );
}
