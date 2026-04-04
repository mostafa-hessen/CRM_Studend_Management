import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '../assets/js/core/state.js';
import { Storage } from '../assets/js/modules/storage.js';

// Mocking Storage
vi.mock('../assets/js/modules/storage.js', () => ({
  Storage: {
    saveData: vi.fn(),
    loadData: vi.fn(),
    saveLogs: vi.fn(),
    loadLogs: vi.fn()
  }
}));

describe('StateManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default classes if no data exists', () => {
        Storage.loadData.mockReturnValue(null);
        Storage.loadLogs.mockReturnValue([]);
        
        StateManager.loadPersistentData();
        const state = StateManager.getState();
        
        expect(state.classes).toHaveLength(4);
        expect(state.classes[0].name).toBe('أولى إعدادي');
    });

    it('should add a log entry if a user is logged in', () => {
        const user = { name: 'وايل', username: 'wael' };
        StateManager.setCurrentUser(user);
        
        StateManager.addLog('Test Action', 'Test Details');
        const state = StateManager.getState();
        
        expect(state.activityLogs[0].action).toBe('Test Action');
        expect(state.activityLogs[0].user).toBe('وايل');
        expect(Storage.saveLogs).toHaveBeenCalled();
    });

    it('should not add a log if no user is logged in', () => {
        StateManager.setCurrentUser(null);
        StateManager.addLog('Action', 'Details');
        expect(Storage.saveLogs).not.toHaveBeenCalled();
    });
});
