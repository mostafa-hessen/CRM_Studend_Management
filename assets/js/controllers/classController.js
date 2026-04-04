import { ClassModel } from '../models/classModel.js';
import { ClassView } from '../views/classView.js';
import { UIService } from '../services/uiService.js';
import { StateManager } from '../core/state.js';

let editingId = null;

export const ClassController = {
  init(initialClasses) {
    this.render();
  },

  render() {
    ClassView.renderList(ClassModel.getAll());
  },

  handleOpenAddModal() {
    editingId = null;
    ClassView.showModal('إضافة صف جديد');
  },

  handleOpenEditModal(id) {
    const classData = ClassModel.getById(id);
    if (!classData) return;
    editingId = id;
    ClassView.showModal('تعديل اسم الصف', classData);
  },

  async handleSave() {
    const name = document.getElementById('cl-name').value.trim();

    if (!name) {
      UIService.showToast('يرجى كتابة اسم الصف', 'error');
      return;
    }

    UIService.setBtnLoading('btn-save-class');
    try {
      const saved = await ClassModel.save(name, editingId);
      await StateManager.addLog(
        editingId ? 'تعديل صف' : 'إضافة صف',
        `${editingId ? 'تعديل' : 'إضافة'} الصف الدراسي: ${name}`
      );
      
      UIService.closeModal('modal-class');
      this.render();
      UIService.showToast('تم حفظ التعديلات بنجاح', 'success');
    } catch (err) {
      UIService.showError(err);

    } finally {
      UIService.clearBtnLoading('btn-save-class');
    }
  },

  async handleDelete(id) {
    try {
      await ClassModel.delete(id);
      this.render();
      UIService.showToast('تم حذف الصف بنجاح', 'success');
    } catch (err) {
      UIService.showError(err);

    }
  }
};
