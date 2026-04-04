import { StorageService } from '../services/storageService.js';
import { StateManager } from '../core/state.js';

export const ClassModel = {
  getAll() {
    return StateManager.getState().classes || [];
  },

  getById(id) {
    return this.getAll().find(c => c.id === id);
  },


  async loadAll() {
    const grades = await StorageService.getGrades();
    StateManager.getState().classes = grades;
    return grades;
  },

  async save(name, id = null) {
    const payload = id ? { id, name } : { name };
    const saved = await StorageService.upsertGrade(payload);
    const classes = this.getAll();
    const idx = classes.findIndex(c => c.id === saved.id);
    if (idx !== -1) classes[idx] = saved;
    else classes.push(saved);
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
