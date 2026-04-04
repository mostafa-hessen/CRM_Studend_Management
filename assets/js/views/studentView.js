import { UIService } from '../services/uiService.js';

export const StudentView = {
  renderTable(students) {
    const tbody = document.getElementById('students-table');
    if (!tbody) return;

    if (!students.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-slate-400">لا يوجد طلاب مسجلون حالياً</td></tr>`;
      return;
    }

    tbody.innerHTML = students.map((s, i) => `
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
        <td>${UIService.getEducationTypeBadge(s.educationType || 'عام')}</td>
        <td class="text-xs text-slate-500 truncate max-w-[120px]">${s.notes || '—'}</td>
        <td>
          <div class="flex gap-2">
            <button onclick="editStudent(${s.id})" class="btn-edit text-xs"><i class="fas fa-edit ml-1"></i>تعديل</button>
            <button onclick="deleteStudent(${s.id})" class="btn-danger text-xs"><i class="fas fa-trash ml-1"></i>حذف</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  getFormData() {
    return {
      name: document.getElementById('s-name').value.trim(),
      phone: document.getElementById('s-phone').value.trim(),
      parentPhone: document.getElementById('s-parent-phone').value.trim(),
      grade: document.getElementById('s-class').value,
      educationType: document.getElementById('s-education-type').value,
      school: document.getElementById('s-school').value.trim(),
      notes: document.getElementById('s-notes').value.trim()
    };
  },

  showModal(title, student = null) {
    document.getElementById('modal-student-title').textContent = title;
    if (student) {
        document.getElementById('s-name').value = student.name || '';
        document.getElementById('s-phone').value = student.phone || '';
        document.getElementById('s-parent-phone').value = student.parentPhone || '';
        document.getElementById('s-class').value = student.grade || '';
        document.getElementById('s-education-type').value = student.educationType || 'عام';
        document.getElementById('s-school').value = student.school || '';
        document.getElementById('s-notes').value = student.notes || '';
    } else {
        ['s-name', 's-phone', 's-parent-phone', 's-class', 's-school', 's-notes'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('s-education-type').value = 'عام';
    }
    UIService.openModal('modal-student');
  },

  closeModal() {
    UIService.closeModal('modal-student');
  }
};
