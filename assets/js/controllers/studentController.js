import { StudentModel } from '../models/studentModel.js';
import { StudentView } from '../views/studentView.js';
import { UIService } from '../services/uiService.js';
import { StateManager } from '../core/state.js';
import { ClassModel } from '../models/classModel.js';


let editingId = null;

  export const StudentController = {
  onStudentSavedCallback: null,

  init(initialStudents) {
    this.render();
  },

  render() {
    StudentView.renderTable(StudentModel.getAll());
  },

  handleFilter(query, gradeId, educationType) {
    let students = StudentModel.getAll();

    if (query) {
      students = students.filter(s => 
        (s.name && s.name.toLowerCase().includes(query)) ||
        (s.phone && s.phone.includes(query)) ||
        (s.school && s.school.toLowerCase().includes(query))
      );
    }

    if (gradeId) {
      students = students.filter(s => s.grade_id && s.grade_id.toString() === gradeId);
    }

    if (educationType) {
      students = students.filter(s => s.education_type === educationType);
    }

    StudentView.renderTable(students);
  },

  handleOpenAddModal() {
    editingId = null;
    StudentView.showModal('إضافة طالب جديد', null, ClassModel.getAll());
  },


  handleOpenEditModal(id) {
    const student = StudentModel.getById(id);
    if (!student) return;
    editingId = id;
    StudentView.showModal('تعديل بيانات الطالب', student, ClassModel.getAll());
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

      if (this.onStudentSavedCallback && !editingId) {
         this.onStudentSavedCallback(saved);
         this.onStudentSavedCallback = null;
      }
    } catch (error) {
      UIService.showError(error);
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
      UIService.showError(error);
    }
  }
};
