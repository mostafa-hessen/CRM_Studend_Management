/**
 * Central State Management
 * @module core/state
 */

import { Storage } from '../modules/storage.js';

let state = {
  students: [],
  campaigns: [],
  campaignStudents: {},
  classes: [],
  nextStudentId: 1,
  nextCampaignId: 1,
  nextClassId: 1,
  activityLogs: [],
  appUsers: {}
};

let currentUser = null;

export const StateManager = {
  getState() {
    return state;
  },

  getCurrentUser() {
    return currentUser;
  },

  setCurrentUser(user) {
    currentUser = user;
  },

  loadPersistentData() {
    const savedData = Storage.loadData();
    if (savedData) {
      state = { ...state, ...savedData };
    } else {
      // Default classes
      state.classes = [
        { id: 1, name: 'أولى إعدادي' },
        { id: 2, name: 'أولى ثانوي' },
        { id: 3, name: 'ثانية ثانوي' },
        { id: 4, name: 'ثالثة ثانوي' }
      ];
      state.nextClassId = 5;
    }
    state.activityLogs = Storage.loadLogs() || [];
  },

  save() {
    Storage.saveData(state);
  },

  addLog(action, details) {
    if (!currentUser) return;
    const logEntry = {
      user: currentUser.name,
      username: currentUser.username,
      action: action,
      details: details,
      time: new Date().toLocaleString('ar-SA')
    };
    state.activityLogs.unshift(logEntry);
    if (state.activityLogs.length > 100) state.activityLogs.pop();
    Storage.saveLogs(state.activityLogs);
  }
};
