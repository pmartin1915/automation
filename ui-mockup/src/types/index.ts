export interface Project {
  id: string;
  name: string;
  language: string;
  testFramework: string;
  tests: {
    total: number;
    passed: number;
    failed: number;
  };
  git: {
    currentBranch: string;
    uncommittedChanges: number;
  };
  lastSession?: {
    timestamp: string;
    outcome: 'success' | 'partial' | 'failed';
  };
  testFiles: TestFile[];
}

export interface TestFile {
  name: string;
  path: string;
  passed: number;
  failed: number;
  tests: Test[];
}

export interface Test {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface Activity {
  id: string;
  type: 'test' | 'commit' | 'push' | 'session';
  message: string;
  timestamp: string;
  status: 'success' | 'error' | 'info';
}
