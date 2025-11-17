"use strict";
// Shared types between main and renderer processes
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC_CHANNELS = void 0;
// IPC Channel names
exports.IPC_CHANNELS = {
    // Project operations
    PROJECT_ADD: 'project:add',
    PROJECT_REMOVE: 'project:remove',
    PROJECT_GET: 'project:get',
    PROJECT_GET_ALL: 'project:getAll',
    PROJECT_UPDATE: 'project:update',
    // Test operations
    TEST_RUN: 'test:run',
    TEST_RUN_ALL: 'test:runAll',
    TEST_OUTPUT: 'test:output',
    TEST_COMPLETE: 'test:complete',
    // Git operations
    GIT_STATUS: 'git:status',
    GIT_COMMIT: 'git:commit',
    GIT_PUSH: 'git:push',
    GIT_PULL: 'git:pull',
    GIT_CREATE_BRANCH: 'git:createBranch',
    GIT_SWITCH_BRANCH: 'git:switchBranch',
    GIT_GET_BRANCHES: 'git:getBranches',
    // Session operations
    SESSION_CREATE: 'session:create',
    SESSION_GET_ALL: 'session:getAll',
    SESSION_UPDATE: 'session:update',
    // Config operations
    CONFIG_GET: 'config:get',
    CONFIG_UPDATE: 'config:update'
};
