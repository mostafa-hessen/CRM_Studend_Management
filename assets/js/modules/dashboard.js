// Dashboard Module
import { UI } from './ui.js';

export const Dashboard = {
  renderStats(stats) {
    const ids = ['stat-total', 'stat-contacted', 'stat-interested', 'stat-registered', 'stat-noanswer', 'dash-total', 'dash-registered'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = stats[id.split('-')[1]] || stats[id.split('-')[1]] === 0 ? stats[id.split('-')[1]] : stats.total;
    });
    
    // Manual mapping for dash-total and dash-registered
    const dashTotal = document.getElementById('dash-total');
    if (dashTotal) dashTotal.textContent = stats.total;
    const dashRegistered = document.getElementById('dash-registered');
    if (dashRegistered) dashRegistered.textContent = stats.registered;
  },

  renderTodayFollowups(followups, containerId) {
    const tbody = document.getElementById(containerId);
    if (!tbody) return;

    tbody.innerHTML = followups.length ? followups.map(s => `
      <tr>
        <td><div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">${s.name[0]}</div>
          <div>
            <p class="font-medium">${s.name}</p>
            <p class="text-[10px] text-slate-400"><i class="fas fa-bullhorn ml-1"></i>${s.campaignName}</p>
          </div>
        </div></td>
        <td><a href="tel:${s.phone}" class="text-blue-600 hover:underline font-mono text-sm">${s.phone}</a></td>
        <td><span class="text-slate-600 text-sm">${s.grade}</span></td>
        <td>${UI.getStatusBadge(s.campaignStatus)}</td>
        <td>
          <a href="tel:${s.phone}" class="btn-success text-xs py-1.5 px-3 inline-flex items-center gap-1">
            <i class="fas fa-phone text-xs"></i> اتصال
          </a>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="5" class="text-center py-8 text-slate-400"><i class="fas fa-check-circle text-2xl text-emerald-400 mb-2 block"></i>لا يوجد طلاب مجدولون اليوم</td></tr>`;
  }
};
