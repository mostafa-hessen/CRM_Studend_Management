import { StorageService } from '../services/storageService.js';
import { StateManager } from '../core/state.js';

export const ClassModel = {
  getAll() {
    return StateManager.getState().classes || [];
  },

  async loadAll() {
    const grades = await StorageService.getGrades();
    StateManager.getState().classes = grades;
    return grades;
  },

  async save(name) {
    const saved = await StorageService.upsertGrade({ name });
    const classes = this.getAll();
    classes.push(saved);
    StateManager.save();
    return saved;
  },

  async delete(id) {
    await StorageService.deleteGrade(id);
    const state = StateManager.getState();
    state.classes = state.classes.filter(c => c.id !== id);
    StateManager.save();
  }
};
