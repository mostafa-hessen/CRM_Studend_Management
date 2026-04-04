import { UIService } from '../services/uiService.js';

export const UserView = {
  renderList(users) {
    const tbody = document.getElementById('users-table');
    if (!tbody) return;

    let html = '';
    users.forEach(u => {
      const isAdmin = u.role === 'admin' || u.role === 'مدير النظام';
      const isSuspended = u.status === 'موقوف';
      html += `
        <tr class="${isSuspended ? 'opacity-50' : ''}">
          <td>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full ${isSuspended ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'} flex items-center justify-center text-sm font-bold flex-shrink-0">
                ${u.full_name ? u.full_name[0] : '?'}
              </div>
              <div>
                <p class="font-bold ${isSuspended ? 'text-red-700 decoration-line-through' : 'text-slate-800'}">${u.full_name}</p>
                <p class="text-xs text-slate-400 font-mono">${u.email || '—'}</p>
              </div>
            </div>
          </td>
          <td><span class="badge ${isAdmin ? 'badge-interested' : 'badge-registered'}">${u.role}</span></td>
          <td>
            <span class="badge ${isSuspended ? 'badge-not-interested' : 'badge-registered'}">${u.status || 'نشط'}</span>
          </td>
          <td>
            <div class="flex gap-2">
              <button onclick="openEditUserModal('${u.id}')" class="btn-edit text-xs p-1 px-2" title="تعديل"><i class="fas fa-edit"></i></button>
              <button onclick="changeAppUserPassword('${u.id}')" class="btn-primary-outline text-xs p-1 px-2" title="تغيير كلمة المرور"><i class="fas fa-key"></i></button>
              ${!isAdmin ? `
                <button onclick="deleteAppUser('${u.id}')" class="btn-danger text-xs p-1 px-2" title="حذف"><i class="fas fa-trash"></i></button>
              ` : '<span class="text-xs text-slate-300 italic">محمي</span>'}
            </div>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html || '<tr><td colspan="4" class="text-center py-10">لا يوجد مستخدمين مسجلين.</td></tr>';
  },

  openModal(id = null, userData = null) {
    document.getElementById('modal-add-user-title').textContent = id ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد';
    
    document.getElementById('u-email').value = userData ? userData.email : '';
    document.getElementById('u-email').disabled = false; // Enabled to allow email edit
    
    document.getElementById('u-name').value = userData ? userData.full_name : '';
    document.getElementById('u-role').value = userData ? userData.role : 'موظف';
    document.getElementById('u-password').value = '';
    
    if (id) {
        document.getElementById('save-user-btn-text').textContent = 'حفظ التعديلات';
        if (document.getElementById('u-status-container')) {
            document.getElementById('u-status-container').style.display = 'block';
            document.getElementById('u-status').value = userData && userData.status ? userData.status : 'نشط';
        }
    } else {
        document.getElementById('save-user-btn-text').textContent = 'إضافة موظف';
        if (document.getElementById('u-status-container')) {
            document.getElementById('u-status-container').style.display = 'none';
        }
    }

    UIService.openModal('modal-add-user');
  }
};
