import { AuthService } from '../services/authService.js';
import { UIService } from '../services/uiService.js';

export const Router = {
  navigate(pageId, currentUser, renderers) {
    if (!currentUser) return;
    
    // Auth Check
    if (pageId === 'users' && !AuthService.isAdmin(currentUser)) {
      UIService.showToast('عذراً، هذه الصفحة للمدراء فقط', 'warning');
      return;
    }

    if (pageId === 'logs' && !AuthService.isAdmin(currentUser)) {
      UIService.showToast('عذراً، هذه الصفحة للمدراء فقط', 'warning');
      return;
    }

    this.renderCurrentPage(currentUser, renderers, pageId);
  },

  renderCurrentPage(currentUser, renderers, forcedPage = null) {
      const activeNav = document.querySelector('.nav-item.active');
      const pageId = forcedPage || (activeNav ? activeNav.id.replace('nav-', '') : 'dashboard');

      // Hide all pages
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      
      // Show target page
      const targetPage = document.getElementById(`page-${pageId}`);
      if (targetPage) targetPage.classList.add('active');

      // Update Nav active state
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.id === `nav-${pageId}`);
      });

      if (renderers[pageId]) renderers[pageId]();
      
      // Close sidebar on mobile
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('open');
  }

};
