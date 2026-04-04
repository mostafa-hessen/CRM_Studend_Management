import { StateManager } from '../core/state.js';

export const LogController = {
  render() {
    const container = document.getElementById('logs-timeline');
    if (!container) return;
    
    const logs = StateManager.getState().activityLogs;
    container.innerHTML = logs.length ? logs.map(l => {
      const timeStr = new Date(l.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date(l.created_at).toLocaleDateString('ar-SA');
      
      return `
        <div class="relative pr-12 group">
          <div class="absolute right-0 top-0 w-11 h-11 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center z-10 transition-transform group-hover:scale-110">
            <i class="fas ${this.getLogIcon(l.action)}"></i>
          </div>
          <div class="bg-white border-b border-slate-50 pb-5">
            <div class="flex items-center justify-between mb-1">
              <h4 class="font-bold text-slate-800">${l.user_id || 'مستخدم'}</h4>
              <span class="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg">${dateStr} ${timeStr}</span>
            </div>
            <p class="text-xs font-black text-blue-600 mb-1">${l.action}</p>
            <p class="text-xs text-slate-500 leading-relaxed">${l.details}</p>
          </div>
        </div>
      `;
    }).join('') : '<div class="p-20 text-center text-slate-400">لا يوجد سجلات نشاط حالياً</div>';
  },

  getLogIcon(action) {
      if (action.includes('إضافة')) return 'fa-plus-circle text-emerald-500';
      if (action.includes('تعديل')) return 'fa-pen-circle text-blue-500';
      if (action.includes('حذف')) return 'fa-trash-alt text-red-500';
      if (action.includes('دخول')) return 'fa-sign-in-alt text-indigo-500';
      return 'fa-info-circle text-slate-400';
  }
};
