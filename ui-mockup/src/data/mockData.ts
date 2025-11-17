import type { Project, Activity } from '@/types';

export const mockProjects: Project[] = [
  {
    id: 'clinical-toolkit',
    name: 'Clinical Toolkit',
    language: 'TypeScript',
    testFramework: 'Jest',
    tests: { total: 113, passed: 113, failed: 0 },
    git: {
      currentBranch: 'claude/mobile-app-conversion-v1',
      uncommittedChanges: 0,
    },
    lastSession: {
      timestamp: '12 mins ago',
      outcome: 'success',
    },
    testFiles: [
      {
        name: 'Home.test.tsx',
        path: 'tests/Home.test.tsx',
        passed: 4,
        failed: 0,
        tests: [
          { name: 'renders welcome message', status: 'passed', duration: 23 },
          { name: 'navigates to COPD page', status: 'passed', duration: 45 },
          { name: 'shows quick links', status: 'passed', duration: 18 },
          { name: 'displays app version', status: 'passed', duration: 12 },
        ],
      },
      {
        name: 'AboutCOPD.test.tsx',
        path: 'tests/AboutCOPD.test.tsx',
        passed: 9,
        failed: 0,
        tests: [
          { name: 'renders COPD information', status: 'passed', duration: 32 },
          { name: 'displays treatment options', status: 'passed', duration: 28 },
          { name: 'shows symptom checklist', status: 'passed', duration: 19 },
          { name: 'validates form inputs', status: 'passed', duration: 41 },
          { name: 'calculates severity score', status: 'passed', duration: 35 },
          { name: 'exports data correctly', status: 'passed', duration: 22 },
          { name: 'handles navigation', status: 'passed', duration: 16 },
          { name: 'displays warnings', status: 'passed', duration: 29 },
          { name: 'renders medication list', status: 'passed', duration: 24 },
        ],
      },
      {
        name: 'Assessments.test.tsx',
        path: 'tests/Assessments.test.tsx',
        passed: 7,
        failed: 0,
        tests: [
          { name: 'renders assessment form', status: 'passed', duration: 27 },
          { name: 'validates required fields', status: 'passed', duration: 33 },
          { name: 'calculates scores', status: 'passed', duration: 38 },
          { name: 'saves assessment data', status: 'passed', duration: 29 },
          { name: 'displays previous results', status: 'passed', duration: 25 },
          { name: 'exports to PDF', status: 'passed', duration: 44 },
          { name: 'handles errors gracefully', status: 'passed', duration: 21 },
        ],
      },
    ],
  },
  {
    id: 'burn-calculator',
    name: 'Burn Calculator',
    language: 'TypeScript',
    testFramework: 'Jest',
    tests: { total: 12, passed: 8, failed: 4 },
    git: {
      currentBranch: 'claude/fix-calculations-v1',
      uncommittedChanges: 5,
    },
    testFiles: [
      {
        name: 'Calculator.test.tsx',
        path: 'tests/Calculator.test.tsx',
        passed: 2,
        failed: 2,
        tests: [
          { name: 'calculates BSA correctly', status: 'passed', duration: 15 },
          { name: 'calculates TBSA for adults', status: 'passed', duration: 20 },
          {
            name: 'calculates TBSA for children',
            status: 'failed',
            duration: 18,
            error: {
              message: 'Expected 18, received 22',
              stack: 'at Calculator.test.tsx:45:12',
            },
          },
          {
            name: 'validates input ranges',
            status: 'failed',
            duration: 10,
            error: {
              message: 'Validation did not trigger for negative values',
              stack: 'at Calculator.test.tsx:67:8',
            },
          },
        ],
      },
      {
        name: 'Formulas.test.ts',
        path: 'tests/Formulas.test.ts',
        passed: 3,
        failed: 1,
        tests: [
          { name: 'Parkland formula calculation', status: 'passed', duration: 12 },
          { name: 'Modified Brooke formula', status: 'passed', duration: 14 },
          {
            name: 'Rule of Nines for pediatrics',
            status: 'failed',
            duration: 11,
            error: {
              message: 'Pediatric head percentage incorrect: expected 18, got 9',
              stack: 'at Formulas.test.ts:89:15',
            },
          },
          { name: 'Fluid resuscitation rates', status: 'passed', duration: 16 },
        ],
      },
      {
        name: 'UI.test.tsx',
        path: 'tests/UI.test.tsx',
        passed: 3,
        failed: 1,
        tests: [
          { name: 'renders calculator interface', status: 'passed', duration: 22 },
          { name: 'updates on input change', status: 'passed', duration: 19 },
          {
            name: 'displays error messages',
            status: 'failed',
            duration: 17,
            error: {
              message: 'Error message not displayed for invalid weight',
              stack: 'at UI.test.tsx:123:10',
            },
          },
          { name: 'exports results to PDF', status: 'passed', duration: 28 },
        ],
      },
    ],
  },
  {
    id: 'automation-platform',
    name: 'Automation Platform',
    language: 'TypeScript',
    testFramework: 'Vitest',
    tests: { total: 0, passed: 0, failed: 0 },
    git: {
      currentBranch: 'claude/automation-project-0158TCzixw1vznjgWkYd3eWa',
      uncommittedChanges: 0,
    },
    testFiles: [],
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'session',
    message: 'Fixed 16 failing tests (Session #42)',
    timestamp: '12 mins ago',
    status: 'success',
  },
  {
    id: '2',
    type: 'commit',
    message: 'Committed: "feat: mobile conversion"',
    timestamp: '15 mins ago',
    status: 'success',
  },
  {
    id: '3',
    type: 'push',
    message: 'Pushed to claude/mobile-app-conversion-v1',
    timestamp: '16 mins ago',
    status: 'success',
  },
  {
    id: '4',
    type: 'test',
    message: 'All tests passing (113/113)',
    timestamp: '20 mins ago',
    status: 'success',
  },
];
