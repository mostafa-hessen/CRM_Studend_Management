/**
 * Central State Management
 */
import { StorageService } from '../services/storageService.js';
import { supabase } from './supabase.js';

let state = {
  students: [],
  campaigns: [],
  campaignStudents: {},
  classes: [],
  activityLogs: [],
  appUsers: {}
};

let currentUser = null;
let listeners = [];

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

  subscribe(callback) {
    listeners.push(callback);
  },

  broadcast() {
    listeners.forEach(cb => cb(state));
  },

  async loadPersistentData() {
    try {
      const [students, campaigns, grades, logs] = await Promise.all([
        StorageService.getStudents(),
        StorageService.getCampaigns(),
        StorageService.getGrades(),
        StorageService.getLogs()
      ]);

      state.students = students || [];
      state.campaigns = campaigns || [];
      state.classes = (grades && grades.length) ? grades : [
        { name: 'أولى إعدادي' },
        { name: 'أولى ثانوي' },
        { name: 'ثانية ثانوي' },
        { name: 'ثالثة ثانوي' }
      ];
      state.activityLogs = logs || [];
    } catch (error) {
      console.error('State load error:', error);
      throw error;
    }
  },

  setupRealtime() {
    supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const { table, eventType, new: newRow, old: oldRow } = payload;
        
        switch (table) {
          case 'students':
            if (eventType === 'INSERT') state.students.push(newRow);
            if (eventType === 'UPDATE') state.students = state.students.map(s => s.id === newRow.id ? newRow : s);
            if (eventType === 'DELETE') state.students = state.students.filter(s => s.id !== oldRow.id);
            break;
            
          case 'campaigns':
            if (eventType === 'INSERT') state.campaigns.push(newRow);
            if (eventType === 'UPDATE') state.campaigns = state.campaigns.map(c => c.id === newRow.id ? newRow : c);
            if (eventType === 'DELETE') state.campaigns = state.campaigns.filter(c => c.id !== oldRow.id);
            break;

          case 'audit_logs':
             if (eventType === 'INSERT') {
                state.activityLogs.unshift(newRow);
                if (state.activityLogs.length > 100) state.activityLogs.pop();
             }
             break;
        }

        this.broadcast();
      })
      .subscribe();
  },

  save() {
    // Local save/sync if needed, but we rely on realtime + storage calls
    this.broadcast();
  },

  async addLog(action, details) {
    if (!currentUser) return;
    const logEntry = {
      user_id: currentUser.id,
      action: action,
      details: details,
      created_at: new Date().toISOString()
    };
    await StorageService.saveLog(logEntry);
  }
};
