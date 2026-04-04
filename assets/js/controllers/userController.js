import { UserModel } from '../models/userModel.js';
import { UserView } from '../views/userView.js';
import { UIService } from '../services/uiService.js';
import { StateManager } from '../core/state.js';

let editingUserId = null;

export const UserController = {
  async init() {
    await UserModel.loadAll();
    this.render();
  },

  render() {
    UserView.renderList(UserModel.getAll());
  },

  handleOpenAddModal() {
    editingUserId = null;
    UserView.openModal();
  },

  handleOpenEditModal(id) {
    editingUserId = id;
    const user = UserModel.getById(id);
    UserView.openModal(id, user);
  },

  async handleSave() {
    const name = document.getElementById('u-name').value.trim();
    const email = document.getElementById('u-email').value.trim();
    const pass = document.getElementById('u-password').value.trim();
    const role = document.getElementById('u-role').value;
    const status = document.getElementById('u-status') ? document.getElementById('u-status').value : 'نشط';
    
    const isEdit = !!editingUserId;

    if (!name || !email || (!isEdit && !pass)) {
      UIService.showToast('يرجى تعبئة كافة الحقول المطلوبة (الاسم، والبريد)', 'error');
      return;
    }

    const userData = { name, email, pass, role, status };
    
    UIService.setBtnLoading('btn-save-user');
    try {
      await UserModel.save(userData, editingUserId);
      
      await StateManager.addLog(
        isEdit ? 'تعديل مستخدم' : 'إضافة مستخدم',
        `${isEdit ? 'تعديل بيانات' : 'إضافة'} المستخدم: ${name}`
      );

      UIService.closeModal('modal-add-user');
      UIService.showToast(`تم ${isEdit ? 'التعديل' : 'الإضافة'} بنجاح`, 'success');
      this.render();
    } catch(err) {
      UIService.showError(err);
    } finally {
      UIService.clearBtnLoading('btn-save-user');
    }
  },

  async handleDelete(id) {
    const user = UserModel.getById(id);
    if (!user) return;
    if (user.role === 'admin' || user.role === 'مدير النظام') {
      UIService.showToast('لا يمكن حذف مدير النظام', 'error');
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف المستخدم (${user.full_name})؟`)) return;

    try {
      await UserModel.delete(id);
      await StateManager.addLog('حذف مستخدم', `حذف المستخدم: ${user.full_name}`);
      UIService.showToast('تم حذف المستخدم بنجاح', 'success');
      this.render();
    } catch(err) {
      UIService.showError(err);
    }
  },

  async handleChangePassword(id) {
    const user = UserModel.getById(id);
    if (!user) return;
    const newPass = prompt(`أدخل كلمة المرور الجديدة لـ ${user.full_name}:`);
    if (!newPass || newPass.trim() === '') return;

    try {
      await UserModel.save({ ...user, name: user.full_name, pass: newPass.trim() }, id);
      await StateManager.addLog('تغيير كلمة مرور', `تغيير كلمة مرور للمستخدم: ${user.full_name}`);
      UIService.showToast('تم تغيير كلمة المرور بنجاح', 'success');
      this.render();
    } catch(err) {
      UIService.showError(err);
    }
  }
};
