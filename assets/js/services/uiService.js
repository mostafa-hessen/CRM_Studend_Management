import { handleSupabaseError } from '../core/errorHandler.js';

export const UIService = {
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
      'إيجابي': 'badge-interested',
      'متردد': 'badge-hesitant',
      'اون لاين': 'badge-call-later',
      'موعد غير مناسب': 'badge-not-interested',
      'اون لاين موعد': 'badge-call-later',
      'خارج الحملة': 'badge-no-answer',
      'حملة زميل': 'badge-no-answer',
      'لم يرد': 'badge-no-answer',
      'لم يتم تحديد الحالة': 'badge-no-answer',
    };
    return `<span class="badge ${map[status] || 'badge-no-answer'}">${status}</span>`;
  },

  getEducationTypeBadge(type) {
    return `<span class="badge ${type === 'أزهري' ? 'badge-call-later' : 'badge-registered'}">${type || 'عام'}</span>`;
  },

  setBtnLoading(btnId, loadingText = 'جاري العمل...') {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.dataset.originalInner = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin ml-2"></i> ${loadingText}`;
  },

  clearBtnLoading(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn || !btn.dataset.originalInner) return;
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalInner;
  },

  showError(err, customMessage = null) {
    const finalMessage = customMessage || handleSupabaseError(err);
    this.showToast(finalMessage, 'error');
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
