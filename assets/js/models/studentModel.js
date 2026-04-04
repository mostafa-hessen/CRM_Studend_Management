import { StorageService } from '../services/storageService.js';
import { StateManager } from '../core/state.js';

export const StudentModel = {
  getAll() {
    return StateManager.getState().students || [];
  },

  getById(id) {
    return this.getAll().find(s => s.id === id);
  },

  async loadAll() {
    const students = await StorageService.getStudents();
    StateManager.getState().students = students;
    return students;
  },

  async save(studentData) {
    const saved = await StorageService.upsertStudent(studentData);
    const students = this.getAll();
    const idx = students.findIndex(s => s.id === saved.id);
    
    if (idx !== -1) students[idx] = saved;
    else students.push(saved);

    StateManager.save();
    return saved;
  },

  async delete(id) {
    await StorageService.deleteStudent(id);
    const state = StateManager.getState();
    state.students = state.students.filter(s => s.id !== id);
    StateManager.save();
  }
};
