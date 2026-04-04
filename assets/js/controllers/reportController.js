/**
 * Report Controller
 */
import { StateManager } from '../core/state.js';

export const ReportController = {
  render() {
    const state = StateManager.getState();
    const students = state.students;
    
    const stats = {
        contacted: students.filter(s => s.status && s.status !== 'لم يرد').length,
        registered: students.filter(s => s.status === 'تم التسجيل').length,
        interested: students.filter(s => s.status === 'مهتم').length,
    };

    const els = {
      'rep-calls': stats.contacted,
      'rep-reg': stats.registered,
      'rep-campaigns': state.campaigns.length,
      'rep-interested': stats.interested
    };

    Object.entries(els).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });
  }
};
