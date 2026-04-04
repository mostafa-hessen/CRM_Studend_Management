/**
 * User View
 */
import { UIService } from '../services/uiService.js';

export const UserView = {
  renderList(users) {
    const tbody = document.getElementById('users-table');
    if (!tbody) return;

    let html = '';
    for (const username in users) {
      const u = users[username];
      const isMaster = username === 'wael';
      html += `
        <tr>
          <td>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold flex-shrink-0">${u.name ? u.name[0] : '?'}</div>
              <div>
                <p class="font-bold text-slate-800">${u.name}</p>
                <p class="text-xs text-slate-400 font-mono">@${username}</p>
              </div>
            </div>
          </td>
          <td><span class="badge ${u.role === 'مدير النظام' ? 'badge-interested' : 'badge-registered'}">${u.role}</span></td>
          <td class="text-xs font-mono text-slate-500">${u.phone || '—'}</td>
          <td>
            <div class="flex gap-2">
              ${!isMaster ? `
                <button onclick="openEditUserModal('${username}')" class="btn-edit text-xs p-1 px-2"><i class="fas fa-edit"></i></button>
                <button onclick="changeAppUserPassword('${username}')" class="btn-primary-outline text-xs p-1 px-2" title="تغيير كلمة المرور"><i class="fas fa-key"></i></button>
                <button onclick="deleteAppUser('${username}')" class="btn-danger text-xs p-1 px-2"><i class="fas fa-trash"></i></button>
              ` : '<span class="text-xs text-slate-300 italic">مدير أساسي (محمي)</span>'}
            </div>
          </td>
        </tr>
      `;
    }
    tbody.innerHTML = html || '<tr><td colspan="4" class="text-center py-10">لا يوجد موظفين مسجلين.</td></tr>';
  },

  openModal(username = null, userData = null) {
    document.getElementById('modal-add-user-title').textContent = username ? 'تعديل بيانات موظف' : 'إضافة موظف جديد';
    document.getElementById('u-username').value = username || '';
    document.getElementById('u-username').disabled = !!username;
    
    document.getElementById('u-name').value = userData ? userData.name : '';
    document.getElementById('u-phone').value = userData ? userData.phone : '';
    document.getElementById('u-password').value = '';
    
    UIService.openModal('modal-add-user');
  }
};
