// Storage Module
export const Storage = {
  saveData(data) {
    localStorage.setItem('student_system_data', JSON.stringify(data));
  },

  loadData() {
    const data = localStorage.getItem('student_system_data');
    return data ? JSON.parse(data) : null;
  },

  saveUsers(users) {
    localStorage.setItem('student_system_users', JSON.stringify(users));
  },

  loadUsers() {
    const data = localStorage.getItem('student_system_users');
    return data ? JSON.parse(data) : null;
  },

  saveLogs(logs) {
    localStorage.setItem('student_system_logs', JSON.stringify(logs));
  },

  loadLogs() {
    const data = localStorage.getItem('student_system_logs');
    return data ? JSON.parse(data) : [];
  },

  clearAll() {
    localStorage.removeItem('student_system_data');
    localStorage.removeItem('student_system_logs');
  }
};
