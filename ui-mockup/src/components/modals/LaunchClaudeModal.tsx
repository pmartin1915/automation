import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Project } from '@/types';
import { Button } from '@/components/ui/button';

interface LaunchClaudeModalProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LaunchClaudeModal({
  project,
  open,
  onOpenChange,
}: LaunchClaudeModalProps) {
  const failedTests = project.testFiles.flatMap((file) =>
    file.tests.filter((test) => test.status === 'failed')
  );

  const context = `I'm working on ${project.name}.

Current status:
- Branch: ${project.git.currentBranch}
- Total tests: ${project.tests.total}
- Passing: ${project.tests.passed}
- Failing: ${project.tests.failed}
${project.git.uncommittedChanges > 0 ? `- Uncommitted changes: ${project.git.uncommittedChanges}` : ''}

${
  failedTests.length > 0
    ? `Specific failures:\n${failedTests.map((t) => `- ${t.name}: ${t.error?.message}`).join('\n')}`
    : 'All tests are passing!'
}

Could you help ${failedTests.length > 0 ? 'fix these test failures' : 'improve the codebase'}?`;

  const handleCopyContext = () => {
    navigator.clipboard.writeText(context);
    alert('Context copied to clipboard!');
  };

  const handleLaunchClaude = () => {
    navigator.clipboard.writeText(context);
    window.open('https://claude.ai/code', '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Launch Claude Code</DialogTitle>
          <DialogDescription>
            Here's the context that will be copied to your clipboard when you launch Claude Code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="text-xs font-mono whitespace-pre-wrap text-gray-800">{context}</pre>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCopyContext}>
              Copy Context
            </Button>
            <Button onClick={handleLaunchClaude}>
              Copy & Launch Claude Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
