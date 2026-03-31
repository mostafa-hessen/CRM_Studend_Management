// Campaigns Module
import { UI } from './ui.js';

export const Campaigns = {
  render(campaignsList, campaignStudentsMap, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const colorPairs = [
      ['bg-blue-50', 'text-blue-700', 'bg-blue-100'],
      ['bg-purple-50', 'text-purple-700', 'bg-purple-100'],
      ['bg-emerald-50', 'text-emerald-700', 'bg-emerald-100'],
      ['bg-amber-50', 'text-amber-700', 'bg-amber-100'],
    ];

    container.innerHTML = campaignsList.length ? campaignsList.map((c, i) => {
      const colors = colorPairs[i % colorPairs.length];
      const total = campaignStudentsMap[c.id] ? campaignStudentsMap[c.id].length : 0;
      const registered = campaignStudentsMap[c.id] ? campaignStudentsMap[c.id].filter(x => x.status === 'تم التسجيل' || x.status === (c.statuses?.split(',')[5] || 'تم التسجيل')).length : 0;
      
      return `
        <div class="campaign-card">
          <div class="flex items-start justify-between mb-4">
            <div onclick="viewCampaign(${c.id})" class="w-11 h-11 ${colors[2]} rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <i class="fas fa-bullhorn ${colors[1]}"></i>
            </div>
            <div class="flex gap-2">
              <button onclick="editCampaign(${c.id})" class="text-slate-400 hover:text-blue-500 transition-colors">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteCampaign(${c.id})" class="text-slate-400 hover:text-red-500 transition-colors">
                <i class="fas fa-trash-alt"></i>
              </button>
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${c.date || 'غير محدد'}</span>
            </div>
          </div>
          <div onclick="viewCampaign(${c.id})" class="cursor-pointer">
            <h3 class="font-bold text-slate-800 mb-1">${c.name}</h3>
            <div class="flex flex-wrap gap-1 mb-3">
               <span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">${c.targetGrade || 'جميع الصفوف'}</span>
               <span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">${c.educationType || 'جميع الأنواع'}</span>
            </div>
            <p class="text-xs text-slate-500 mb-4 line-clamp-2">${c.notes || 'لا توجد ملاحظات...'}</p>
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="text-slate-500">${total} طالب</span>
              <span class="${colors[2]} ${colors[1]} px-2 py-1 rounded-lg font-bold">${registered} سجلوا</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5">
              <div class="bg-blue-600 h-1.5 rounded-full transition-all" style="width: ${total ? (registered/total)*100 : 0}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('') : `<div class="md:col-span-3 text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">لا توجد حملات منشأة حالياً</div>`;
  },

  renderCampaignStudents(cid, campaignsList, studentsList, campaignStudentsMap, containerId) {
    const tbody = document.getElementById(containerId);
    if (!tbody) return;

    const campaign = campaignsList.find(x => x.id === cid);
    if (!campaign) return;

    const cs = campaignStudentsMap[cid] || [];
    const customStatuses = campaign.statuses ? campaign.statuses.split(',').map(s => s.trim()) : ['مهتم','متردد','غير مهتم','اتصل لاحقًا','لم يرد','تم التسجيل'];
    if (!customStatuses.includes('لم يتم تحديد الحالة')) customStatuses.push('لم يتم تحديد الحالة');

    tbody.innerHTML = cs.length ? cs.map(entry => {
      const s = studentsList.find(x => x.id === entry.studentId);
      if (!s) return '';
      return `
        <tr>
          <td>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">${s.name ? s.name[0] : '?'}</div>
              <div>
                <span class="font-medium text-sm block">${s.name}</span>
                <span class="text-[10px] text-slate-400">${s.grade} - ${s.educationType || 'عام'}</span>
              </div>
            </div>
          </td>
          <td><a href="tel:${s.phone}" class="text-blue-600 text-sm font-mono hover:underline">${s.phone}</a></td>
          <td>
            <select class="status-select p-1 text-xs border rounded bg-white" onchange="updateCampaignStudentStatus(${cid}, ${s.id}, this.value)">
              ${customStatuses.map(opt => `<option ${entry.status === opt ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
          </td>
          <td>
            <input type="date" class="form-input text-xs py-1.5 px-2 border rounded" value="${entry.followupDate || ''}"
              onchange="updateCampaignStudentFollowupDate(${cid}, ${s.id}, this.value)"
              style="width:130px"/>
          </td>
          <td>
            <input type="text" class="form-input text-xs py-1.5 px-2 border rounded w-full" placeholder="ملاحظة..." value="${entry.notes || ''}"
              onchange="updateCampaignStudentNotes(${cid}, ${s.id}, this.value)"/>
          </td>
        </tr>
      `;
    }).join('') : `
      <tr>
        <td colspan="5" class="text-center py-12">
          <p class="text-slate-400 mb-4">لا يوجد طلاب في هذه الحملة حالياً</p>
          <button onclick="addAllStudentsToCampaign(${cid})" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-blue-700 transition-colors">
            <i class="fas fa-users ml-1"></i> إضافة الطلاب المطابقين لهذه الحملة
          </button>
        </td>
      </tr>`;
  },

  handleSave(state, editingId, data, callbacks) {
    if (!data.name) {
      UI.showToast('اسم الحملة مطلوب', 'error');
      return false;
    }

    if (editingId) {
      const idx = state.campaigns.findIndex(c => c.id === editingId);
      state.campaigns[idx] = { ...state.campaigns[idx], ...data };
      callbacks.addLog('تعديل حملة', `عدل بيانات الحملة: ${data.name}`);
    } else {
      const newCampaign = { ...data, id: state.nextCampaignId++ };
      state.campaigns.push(newCampaign);
      state.campaignStudents[newCampaign.id] = [];
      callbacks.addLog('إنشاء حملة', `أنشأ حملة جديدة باسم: ${data.name}`);
    }
    return true;
  }
};

