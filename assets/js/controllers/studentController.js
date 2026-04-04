import { StudentModel } from '../models/studentModel.js';
import { StudentView } from '../views/studentView.js';
import { UIService } from '../services/uiService.js';
import { StateManager } from '../core/state.js';

let editingId = null;

export const StudentController = {
  init(initialStudents) {
    // Model manages state via StateManager now
    this.render();
  },

  render() {
    StudentView.renderTable(StudentModel.getAll());
  },

  handleOpenAddModal() {
    editingId = null;
    StudentView.showModal('إضافة طالب جديد');
  },

  handleOpenEditModal(id) {
    const student = StudentModel.getById(id);
    if (!student) return;
    editingId = id;
    StudentView.showModal('تعديل بيانات الطالب', student);
  },

  async handleSave() {
    const data = StudentView.getFormData();
    if (editingId) data.id = editingId;

    if (!data.name || !data.phone) {
      UIService.showToast('الاسم ورقم الهاتف مطلوبان', 'error');
      return;
    }

    UIService.setBtnLoading('btn-save-student');
    try {
      const saved = await StudentModel.save(data);
      await StateManager.addLog(
        editingId ? 'تعديل طالب' : 'إضافة طالب',
        `${editingId ? 'عدل بيانات' : 'أضاف طالباً جديداً'}: ${saved.name}`
      );
      
      StudentView.closeModal();
      this.render();
      UIService.showToast(editingId ? 'تم التحديث بنجاح' : 'تمت الإضافة بنجاح', 'success');
    } catch (error) {
      UIService.showError(error, 'فشل في حفظ البيانات');
    } finally {
      UIService.clearBtnLoading('btn-save-student');
    }
  },

  async handleDelete(id) {
    try {
      await StudentModel.delete(id);
      this.render();
      UIService.showToast('تم حذف الطالب بنجاح', 'success');
    } catch (error) {
      UIService.showError(error, 'فشل في حذف الطالب');
    }
  }
};
