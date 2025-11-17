import type { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GitStatus from '@/components/GitStatus';
import QuickActions from '@/components/QuickActions';
import TestFileList from '@/components/TestFileList';
import ActivityFeed from '@/components/ActivityFeed';

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const { tests, lastSession } = project;
  const allPassing = tests.failed === 0 && tests.total > 0;
  const hasFailing = tests.failed > 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{project.name}</CardTitle>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {allPassing && (
                    <Badge variant="success" className="text-sm">
                      ✅ All Tests Passing ({tests.passed}/{tests.total})
                    </Badge>
                  )}
                  {hasFailing && (
                    <Badge variant="destructive" className="text-sm">
                      ❌ {tests.failed} Tests Failing ({tests.passed}/{tests.total})
                    </Badge>
                  )}
                  {tests.total === 0 && (
                    <Badge variant="secondary" className="text-sm">
                      No Tests
                    </Badge>
                  )}
                </div>

                <GitStatus
                  currentBranch={project.git.currentBranch}
                  uncommittedChanges={project.git.uncommittedChanges}
                />

                {lastSession && (
                  <p className="text-sm text-gray-500">
                    Last session: {lastSession.timestamp} ({lastSession.outcome})
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <QuickActions project={project} />
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Suites</CardTitle>
        </CardHeader>
        <CardContent>
          <TestFileList testFiles={project.testFiles} />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed />
        </CardContent>
      </Card>
    </div>
  );
}
