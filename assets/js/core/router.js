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

      document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
      const activeSection = document.getElementById(`section-${pageId}`);
      if (activeSection) activeSection.classList.remove('hidden');

      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.id === `nav-${pageId}`);
      });

      if (renderers[pageId]) renderers[pageId]();
      
      // Close sidebar on mobile after navigation
      document.getElementById('sidebar').classList.remove('open');
  }
};
