// Students Module
import { UI } from './ui.js';

export const Students = {
  render(studentsList, containerId) {
    const tbody = document.getElementById(containerId);
    if (!tbody) return;

    tbody.innerHTML = studentsList.length ? studentsList.map((s, i) => `
      <tr>
        <td class="text-slate-400 font-bold text-sm">${i + 1}</td>
        <td>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">${s.name ? s.name[0] : '?'}</div>
            <div>
              <p class="font-semibold text-slate-800">${s.name || 'مجهول'}</p>
              <p class="text-xs text-slate-400">${s.school || '—'}</p>
            </div>
          </div>
        </td>
        <td><a href="tel:${s.phone}" class="text-blue-600 hover:underline font-mono text-sm">${s.phone}</a></td>
        <td class="text-sm text-slate-600 font-mono">${s.parentPhone || '—'}</td>
        <td><span class="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-semibold">${s.grade || '—'}</span></td>
        <td>${UI.getEducationTypeBadge(s.educationType || 'عام')}</td>
        <td class="text-xs text-slate-500 truncate max-w-[120px]">${s.notes || '—'}</td>
        <td>
          <div class="flex gap-2">
            <button onclick="editStudent(${s.id})" class="btn-edit text-xs">
              <i class="fas fa-edit ml-1"></i>تعديل
            </button>
            <button onclick="deleteStudent(${s.id})" class="btn-danger text-xs">
              <i class="fas fa-trash ml-1"></i>حذف
            </button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="8" class="text-center py-10 text-slate-400"><i class="fas fa-users text-3xl mb-2 block text-slate-300"></i>لا يوجد طلاب مسجلون حالياً</td></tr>`;
  },

  validate(data, existingStudents) {
    if (!data.name || !data.phone) {
      UI.showToast('الاسم ورقم الهاتف مطلوبان', 'error');
      return false;
    }
    const duplicate = existingStudents.find(s => s.phone === data.phone && s.id !== data.id);
    if (duplicate) {
      UI.showToast('رقم الهاتف هذا مسجل مسبقاً طالباً آخر', 'error');
      return false;
    }
    return true;
  },

  handleSave(state, editingId, data, currentCampaignId, callbacks) {
    if (!this.validate(data, state.students)) return false;

    if (editingId) {
      const idx = state.students.findIndex(s => s.id === editingId);
      state.students[idx] = { ...state.students[idx], ...data };
      callbacks.addLog('تعديل طالب', `عدل بيانات الطالب: ${data.name}`);
    } else {
      const newStudent = { ...data, id: state.nextStudentId++, status: 'لم يتم تحديد الحالة' };
      state.students.push(newStudent);
      callbacks.addLog('إضافة طالب', `أضاف طالباً جديداً: ${data.name}`);

      if (currentCampaignId) {
        const campaign = state.campaigns.find(x => x.id === currentCampaignId);
        const firstStatus = campaign.statuses?.split(',')[0] || 'لم يتم تحديد الحالة';
        if (!state.campaignStudents[currentCampaignId]) state.campaignStudents[currentCampaignId] = [];
        state.campaignStudents[currentCampaignId].push({
          studentId: newStudent.id,
          status: firstStatus,
          notes: '',
          followupDate: ''
        });
      }
    }
    return true;
  }
};

