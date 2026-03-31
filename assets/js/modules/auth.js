// Auth Module
import { Storage } from './storage.js';

export const Auth = {
  getInitialUsers() {
    return {
      'wael': { name: 'الشيخ وائل', role: 'مدير النظام', pass: '123456', phone: '01012345678', avatar: 'https://i.ibb.co/DgWdcYp8/Whats-App-Image-2026-03-13-at-15-47-40.jpg' },
      'sara': { name: 'سارة', role: 'موظفة', pass: '1234', phone: '01122334455', avatar: '' },
      'habiba': { name: 'حبيبة', role: 'موظفة', pass: '1234', phone: '01233445566', avatar: '' }
    };
  },

  getCurrentUser() {
    const logged = sessionStorage.getItem('logged_in_user');
    return logged ? JSON.parse(logged) : null;
  },

  login(username, password, users) {
    const user = users[username];
    if (user && user.pass === password) {
      const userData = { username, ...user };
      sessionStorage.setItem('logged_in_user', JSON.stringify(userData));
      return userData;
    }
    return null;
  },

  logout() {
    // sessionStorage.removeItem('logged_in_user');
    // location.reload();
    alert("ام حمزه")
  },

  isAdmin(user) {
    return user && user.role === 'مدير النظام';
  }
};
