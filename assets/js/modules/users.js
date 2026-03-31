/**
 * User Management Module
 * @module modules/users
 */

import { UI } from './ui.js';
import { StateManager } from '../core/state.js';

export const UserManagement = {
    render(appUsers) {
        const container = document.getElementById('users-list');
        if (!container) return;
        
        container.innerHTML = Object.entries(appUsers).map(([username, data]) => `
          <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-lg font-bold">${data.name[0]}</div>
              <div>
                <h4 class="font-bold text-slate-800">${data.name}</h4>
                <div class="flex items-center gap-2 text-xs text-slate-400">
                   <span>@${username}</span>
                   ${data.phone ? `<span class="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100"><i class="fas fa-phone-alt ml-1"></i>${data.phone}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="flex gap-2">
               <button onclick="window.openEditUserModal('${username}')" class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="تعديل الموظف">
                 <i class="fas fa-user-edit"></i>
               </button>
               <button onclick="window.changeAppUserPassword('${username}')" class="text-amber-500 hover:bg-amber-50 p-2 rounded-lg transition-colors" title="تغيير كلمة المرور">
                 <i class="fas fa-key"></i>
               </button>
               ${username !== 'wael' ? `
                 <button onclick="window.deleteAppUser('${username}')" class="text-red-500 hover:bg-red p-2 rounded-lg transition-colors" title="حذف الموظف">
                   <i class="fas fa-trash-alt"></i>
                 </button>
               ` : ''}
            </div>
          </div>
        `).join('') + `
          <div onclick="window.openAddUserModal()" class="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm mb-2">
              <i class="fas fa-user-plus"></i>
            </div>
            <span class="text-sm font-bold text-slate-500 group-hover:text-blue-600">إضافة موظف جديد</span>
          </div>
        `;
    },

    saveUser(name, username, phone, password, isEdit = false) {
        const state = StateManager.getState();
        if (!name || !username) {
            UI.showToast('الاسم واسم المستخدم مطلوبان', 'error');
            return false;
        }

        // If not edit, password is required
        if (!isEdit && !password) {
            UI.showToast('كلمة المرور مطلوبة', 'error');
            return false;
        }

        if (!isEdit && state.appUsers[username]) {
          UI.showToast('اسم المستخدم هذا موجود بالفعل', 'error');
          return false;
        }
      
        const existing = state.appUsers[username] || {};
        state.appUsers[username] = { 
            ...existing,
            name, 
            phone,
            pass: password || existing.pass, 
            role: existing.role || 'موظف' 
        };
        
        StateManager.addLog(isEdit ? 'تعديل موظف' : 'إضافة موظف', `${isEdit ? 'عدل' : 'أضاف'} موظف: ${name} (@${username})`);
        StateManager.save();
        UI.showToast(`تم ${isEdit ? 'تحديث' : 'حفظ'} الموظف بنجاح`, 'success');
        return true;
    },

    deleteUser(username) {
        const state = StateManager.getState();
        if (username === 'wael') return;
        if (confirm(`هل أنت متأكد من حذف الموظف ${state.appUsers[username].name}؟`)) {
            const name = state.appUsers[username].name;
            delete state.appUsers[username];
            StateManager.addLog('حذف موظف', `حذف الموظف: ${name} (@${username})`);
            StateManager.save();
            UI.showToast('تم حذف الموظف بنجاح', 'success');
            return true;
        }
        return false;
    },

    changePassword(username) {
        const newPass = prompt(`أدخل كلمة المرور الجديدة للموظف ${username}:`);
        if (newPass && newPass.trim().length > 0) {
            const state = StateManager.getState();
            state.appUsers[username].pass = newPass.trim();
            StateManager.addLog('تغيير كلمة مرور', `غير كلمة مرور الموظف: ${state.appUsers[username].name} (@${username})`);
            StateManager.save();
            UI.showToast('تم تغيير كلمة المرور بنجاح', 'success');
            return true;
        }
        return false;
    }
};
