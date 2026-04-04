/**
 * User Model
 */
import { StateManager } from '../core/state.js';

export const UserModel = {
  getAll() {
    return StateManager.getState().appUsers || {};
  },

  getByUsername(username) {
    return this.getAll()[username];
  },

  save(username, userData) {
    const state = StateManager.getState();
    const isEdit = !!state.appUsers[username];
    
    state.appUsers[username] = {
      ...(state.appUsers[username] || {}),
      ...userData,
      role: state.appUsers[username]?.role || 'موظف'
    };

    StateManager.save();
    return isEdit;
  },

  delete(username) {
    if (username === 'wael') return false;
    const state = StateManager.getState();
    const name = state.appUsers[username]?.name;
    delete state.appUsers[username];
    StateManager.save();
    return name;
  },

  updatePassword(username, newPass) {
    const state = StateManager.getState();
    if (state.appUsers[username]) {
      state.appUsers[username].pass = newPass;
      StateManager.save();
      return true;
    }
    return false;
  }
};
