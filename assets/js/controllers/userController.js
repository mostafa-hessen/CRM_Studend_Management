import { UserModel } from '../models/userModel.js';
import { UserView } from '../views/userView.js';
import { UIService } from '../services/uiService.js';
import { StateManager } from '../core/state.js';

let editingUsername = null;

export const UserController = {
  render() {
    UserView.renderList(UserModel.getAll());
  },

  handleOpenAddModal() {
    editingUsername = null;
    UserView.openModal();
  },

  handleOpenEditModal(username) {
    editingUsername = username;
    const user = UserModel.getByUsername(username);
    UserView.openModal(username, user);
  },

  async handleSave() {
    const username = document.getElementById('u-username').value.trim();
    const name = document.getElementById('u-name').value.trim();
    const phone = document.getElementById('u-phone').value.trim();
    const pass = document.getElementById('u-password').value.trim();
    const isEdit = !!editingUsername;

    if (!name || !username) {
      UIService.showToast('يرجى تعبئة كافة الحقول المطلوبة', 'error');
      return;
    }

    if (!isEdit && !pass) {
      UIService.showToast('كلمة المرور مطلوبة للموظفين الجدد', 'error');
      return;
    }

    const userData = { name, phone };
    if (pass) userData.pass = pass;

    const resultIsEdit = UserModel.save(isEdit ? editingUsername : username, userData);
    
    await StateManager.addLog(
      resultIsEdit ? 'تعديل موظف' : 'إضافة موظف',
      `${resultIsEdit ? 'تعديل' : 'إضافة'} الموظف: ${name} (@${username})`
    );

    UIService.closeModal('modal-add-user');
    UIService.showToast(`تم ${resultIsEdit ? 'تعديل' : 'إضافة'} الموظف بنجاح`, 'success');
    this.render();
  },

  handleDelete(username) {
    if (username === 'wael') return;
    if (!confirm(`هل أنت متأكد من حذف الموظف (@${username})؟`)) return;

    const name = UserModel.delete(username);
    if (name) {
      StateManager.addLog('حذف موظف', `حذف الموظف: ${name} (@${username})`);
      UIService.showToast('تم حذف الموظف بنجاح', 'success');
      this.render();
    }
  },

  handleChangePassword(username) {
    const newPass = prompt(`أدخل كلمة المرور الجديدة لـ ${username}:`);
    if (!newPass || newPass.trim() === '') return;

    if (UserModel.updatePassword(username, newPass.trim())) {
      StateManager.addLog('تغيير كلمة مرور', `تغيير كلمة مرور الموظف: (@${username})`);
      UIService.showToast('تم تغيير كلمة المرور بنجاح', 'success');
      this.render();
    }
  }
};
