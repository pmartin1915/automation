import type { TestFile } from '@/types';
import TestFileItem from '@/components/TestFileItem';

interface TestFileListProps {
  testFiles: TestFile[];
}

export default function TestFileList({ testFiles }: TestFileListProps) {
  if (testFiles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No test files configured for this project.</p>
        <p className="text-sm mt-2">Add test files to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {testFiles.map((testFile, index) => (
        <TestFileItem key={index} testFile={testFile} />
      ))}
    </div>
  );
}
