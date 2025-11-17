import type { Project } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
}

export default function ProjectCard({ project, isSelected, onClick }: ProjectCardProps) {
  const { tests } = project;
  const allPassing = tests.failed === 0 && tests.total > 0;
  const hasFailing = tests.failed > 0;
  const noTests = tests.total === 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected
          ? 'bg-blue-50 border-blue-300 shadow-md'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
      </div>

      <div className="flex items-center gap-2">
        {allPassing && (
          <Badge variant="success" className="text-xs">
            ✅ {tests.passed}/{tests.total}
          </Badge>
        )}
        {hasFailing && (
          <Badge variant="warning" className="text-xs">
            ⚠️ {tests.passed}/{tests.total}
          </Badge>
        )}
        {noTests && (
          <Badge variant="secondary" className="text-xs">
            ✅ {tests.total}/{tests.total}
          </Badge>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        {project.testFramework}
      </div>
    </button>
  );
}
