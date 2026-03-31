/**
 * Router Implementation
 * @module core/router
 */

import { Auth } from '../modules/auth.js';
import { UI } from '../modules/ui.js';

export const Router = {
  navigate(page, currentUser, renderers) {
    const adminOnly = ['users', 'logs'];
    if (adminOnly.includes(page) && !Auth.isAdmin(currentUser)) {
      UI.showToast('عذراً، لا تملك صلاحية الوصول لهذه الصفحة', 'error');
      return;
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');

    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(n => {
      if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(page)) {
        n.classList.add('active');
      }
    });

    const pageTitle = document.getElementById('page-title');
    const pageTitles = {
      dashboard: 'لوحة التحكم',
      students: 'الطلاب',
      campaigns: 'الحملات',
      followups: 'المتابعات',
      reports: 'التقارير',
      classes: 'الصفوف الدراسية',
      guide: 'دليل الاستخدام',
      users: 'إدارة المستخدمين',
      logs: 'سجل النشاطات'
    };
    if (pageTitle) pageTitle.textContent = pageTitles[page] || '';

    // Render corresponding page content
    if (renderers[page]) {
      renderers[page]();
    }

    document.getElementById('sidebar').classList.remove('open');
  }
};
