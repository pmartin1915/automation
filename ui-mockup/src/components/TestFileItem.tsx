import { useState } from 'react';
import type { TestFile } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TestFileItemProps {
  testFile: TestFile;
}

export default function TestFileItem({ testFile }: TestFileItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const allPassing = testFile.failed === 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}

          <span className="font-mono text-sm text-gray-900">{testFile.name}</span>

          {allPassing ? (
            <Badge variant="success" className="text-xs">
              ✅ {testFile.passed}/{testFile.tests.length}
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              ❌ {testFile.passed}/{testFile.tests.length}
            </Badge>
          )}
        </div>

        <span className="text-xs text-gray-500">{testFile.path}</span>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2">
            {testFile.tests.map((test, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  test.status === 'passed' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      test.status === 'passed' ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {test.status === 'passed' ? '✅' : '❌'} {test.name}
                  </span>
                  <span className="text-xs text-gray-500">{test.duration}ms</span>
                </div>

                {test.error && (
                  <div className="mt-2 p-2 bg-white rounded border border-red-200">
                    <p className="text-xs font-mono text-red-700">{test.error.message}</p>
                    {test.error.stack && (
                      <p className="text-xs font-mono text-gray-500 mt-1">
                        {test.error.stack}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
