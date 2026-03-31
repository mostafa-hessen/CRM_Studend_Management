// UI Helpers
export const UI = {
  showToast(message, type = 'info') {
    const icons = { 
      success: 'fa-check-circle text-emerald-500', 
      error: 'fa-times-circle text-red-500', 
      warning: 'fa-exclamation-circle text-amber-500', 
      info: 'fa-info-circle text-blue-500' 
    };
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info} text-lg"></i><span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  getStatusBadge(status) {
    const map = {
      'مهتم': 'badge-interested',
      'متردد': 'badge-hesitant',
      'غير مهتم': 'badge-not-interested',
      'اتصل لاحقًا': 'badge-call-later',
      'لم يرد': 'badge-no-answer',
      'تم التسجيل': 'badge-registered',
      'لم يتم تحديد الحالة': 'badge-no-answer',
    };
    return `<span class="badge ${map[status] || 'badge-no-answer'}">${status}</span>`;
  },

  getEducationTypeBadge(type) {
    return `<span class="badge ${type === 'أزهري' ? 'badge-call-later' : 'badge-registered'}">${type || 'عام'}</span>`;
  },

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  },

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('open');
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('open');
  }
};

