import { StateManager } from '../core/state.js';
import { AuthService } from '../services/authService.js';
import { UIService } from '../services/uiService.js';

export const FollowupController = {
  render() {
    const state = StateManager.getState();
    const tbody = document.getElementById('followups-table');
    if (!tbody) return;

    const isAdmin = AuthService.isAdmin(StateManager.getCurrentUser());
    const managedCampaigns = isAdmin 
      ? state.campaigns 
      : state.campaigns.filter(c => c.assignedEmployees?.includes(StateManager.getCurrentUser().username));
    
    let html = '';
    managedCampaigns.forEach(c => {
        const campaignStatuses = c.statuses ? JSON.parse(c.statuses) : [];
        const followupStatuses = campaignStatuses
            .filter(t => t.type === 'followup')
            .map(t => t.name || t);
        
        // Fallback or unmigrated data
        const fallback = ['لم يرد', 'اتصل لاحقًا', 'متردد', 'مهتم'];
        const effectiveFollowup = followupStatuses.length ? followupStatuses : fallback;

        const cs = (state.campaignStudents[c.id] || []).filter(e => 
          effectiveFollowup.includes(e.status)
        );

        if (cs.length) {
            html += `<tr class="bg-slate-50"><td colspan="6" class="py-2 px-4 font-bold border-b border-slate-200">${c.name}</td></tr>`;
            cs.forEach(e => {
                const s = state.students.find(x => x.id === e.studentId);
                if (s) {
                  html += `
                    <tr>
                      <td>${s.name}</td>
                      <td>${s.phone}</td>
                      <td>${UIService.getStatusBadge(e.status)}</td>
                      <td>${e.followupDate || '—'}</td>
                      <td>${e.notes || '—'}</td>
                      <td><a href="tel:${s.phone}" class="btn-primary text-xs px-2 py-1">اتصال</a></td>
                    </tr>`;
                }
            });
        }
    });

    tbody.innerHTML = html || '<tr><td colspan="6" class="text-center py-10">لا يوجد متابعات مستحقة حالياً</td></tr>';
  }
};
