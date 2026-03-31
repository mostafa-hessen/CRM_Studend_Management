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
                <p class="text-xs text-slate-400">@${username} ${username === 'wael' ? ' (مدير)' : ''}</p>
              </div>
            </div>
            <div class="flex gap-2">
               <button onclick="promptChangePassword('${username}')" class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="تغيير كلمة المرور">
                 <i class="fas fa-key"></i>
               </button>
               ${username !== 'wael' ? `
                 <button onclick="deleteAppUser('${username}')" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="حذف الموظف">
                   <i class="fas fa-trash-alt"></i>
                 </button>
               ` : ''}
            </div>
          </div>
        `).join('') + `
          <div onclick="UI.openModal('modal-add-user')" class="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm mb-2">
              <i class="fas fa-user-plus"></i>
            </div>
            <span class="text-sm font-bold text-slate-500 group-hover:text-blue-600">إضافة موظف جديد</span>
          </div>
        `;
    },

    saveUser(name, username, password) {
        const state = StateManager.getState();
        if (!name || !username || !password) {
          UI.showToast('جميع الحقول مطلوبة', 'error');
          return false;
        }
        if (state.appUsers[username]) {
          UI.showToast('اسم المستخدم هذا موجود بالفعل', 'error');
          return false;
        }
      
        state.appUsers[username] = { name, password };
        StateManager.addLog('إضافة موظف', `أضاف موظف جديد: ${name} (@${username})`);
        StateManager.save();
        UI.showToast('تم إضافة الموظف بنجاح', 'success');
        return true;
    }
};
