import { Badge } from '@/components/ui/badge';
import { GitBranch, FileEdit } from 'lucide-react';

interface GitStatusProps {
  currentBranch: string;
  uncommittedChanges: number;
}

export default function GitStatus({ currentBranch, uncommittedChanges }: GitStatusProps) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-gray-500" />
        <span className="font-mono text-gray-700">{currentBranch}</span>
      </div>

      {uncommittedChanges > 0 && (
        <div className="flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-yellow-500" />
          <Badge variant="warning" className="text-xs">
            {uncommittedChanges} uncommitted
          </Badge>
        </div>
      )}
    </div>
  );
}
