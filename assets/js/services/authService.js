/**
 * Auth Service - User Security Layer
 */
import { StateManager } from '../core/state.js';

export const AuthService = {
  getCurrentUser() {
    const logged = sessionStorage.getItem('logged_in_user');
    return logged ? JSON.parse(logged) : null;
  },

  login(username, password, appUsers) {
    const user = appUsers[username];
    if (user && user.pass === password) {
      const userData = { username, ...user };
      sessionStorage.setItem('logged_in_user', JSON.stringify(userData));
      return userData;
    }
    return null;
  },

  async logout() {
    await StateManager.addLog('تسجيل خروج', 'خرج من النظام');
    sessionStorage.removeItem('logged_in_user');
    location.reload();
  },

  isAdmin(user) {
    return user && user.role === 'مدير النظام';
  }
};
