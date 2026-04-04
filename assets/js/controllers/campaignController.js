import { CampaignModel } from '../models/campaignModel.js';
import { CampaignView } from '../views/campaignView.js';
import { StudentModel } from '../models/studentModel.js';
import { StateManager } from '../core/state.js';
import { UIService } from '../services/uiService.js';
import { StorageService } from '../services/storageService.js';

let editingId = null;

export const CampaignController = {
  // Use state from core/state
  init(campaigns) {
    this.render();
  },

  render() {
    CampaignView.renderList(CampaignModel.getAll());
  },

  handleOpenAddModal() {
    editingId = null;
    CampaignView.showCampaignModal('إنشاء حملة جديدة');
  },

  handleOpenEditModal(id) {
    const campaign = CampaignModel.getById(id);
    if (!campaign) return;
    editingId = id;
    CampaignView.showCampaignModal('تعديل الحملة', campaign);
  },

  async handleSave() {
    const data = CampaignView.getFormData();
    UIService.setBtnLoading('btn-save-campaign');
    try {
      const saved = await CampaignModel.save(data, editingId);
      await StateManager.addLog(
        editingId ? 'تعديل حملة' : 'إنشاء حملة',
        `${editingId ? 'تعديل بيانات' : 'إنشاء سجل حملة جديد'}: ${saved.name}`
      );
      
      UIService.closeModal('modal-campaign');
      this.render();
      UIService.showToast('تم حفظ تغييرات الحملة بنجاح', 'success');
    } catch (err) {
      UIService.showError(err, 'حدث خطأ أثناء حفظ الحملة.');
    } finally {
      UIService.clearBtnLoading('btn-save-campaign');
    }
  },

  async handleDelete(id) {
    try {
      await CampaignModel.delete(id);
      this.render();
      UIService.showToast('تم حذف الحملة بنجاح', 'success');
    } catch (err) {
      UIService.showError(err, 'فشل في حذف الحملة');
    }
  },

  async handleViewCampaign(id) {
    await CampaignModel.loadCampaignStudents(id);
    CampaignView.renderView(id, CampaignModel.getById(id), CampaignModel.getCampaignStudents(id), StudentModel.getAll());
  },

  async updateStudentStatus(cid, sid, status) {
    await CampaignModel.updateStudentInCampaign(cid, sid, { status });
    UIService.showToast('تم تحديث حالة التواصل', 'success');
  },

  async updateStudentFollowup(cid, sid, followupDate) {
    await CampaignModel.updateStudentInCampaign(cid, sid, { followupDate });
    UIService.showToast('تم تحديث موعد المتابعة', 'success');
  },

  async updateStudentNotes(cid, sid, notes) {
    await CampaignModel.updateStudentInCampaign(cid, sid, { notes });
    UIService.showToast('تم تحديث الملاحظة', 'success');
  },

  addStatusTag(tag) {
    const tags = CampaignView.getStatuses();
    if (tag && !tags.includes(tag)) {
        tags.push(tag);
        CampaignView.renderStatusTags(tags);
    }
  },

  removeStatusTag(tag) {
    const tags = CampaignView.getStatuses().filter(t => t !== tag);
    CampaignView.renderStatusTags(tags);
  },

  async syncMissingStudents(cid) {
    const campaign = CampaignModel.getById(cid);
    if (!campaign) return;

    const allStudents = StudentModel.getAll();
    const studentsInCampaign = CampaignModel.getCampaignStudents(cid);

    const matches = allStudents.filter(s => {
      const matchesGrade = campaign.targetGrade === 'الكل' || s.grade === campaign.targetGrade;
      const matchesType = campaign.educationType === 'الكل' || s.educationType === campaign.educationType;
      return matchesGrade && matchesType;
    });

    let addedCount = 0;
    for (const student of matches) {
      if (!studentsInCampaign.find(e => e.studentId === student.id)) {
        await StorageService.upsertCampaignStudent({
          campaign_id: cid,
          student_id: student.id,
          status: 'لم يتم الاتصال',
          notes: '',
          followup_date: null
        });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await CampaignModel.loadCampaignStudents(cid);
      this.handleViewCampaign(cid); // Refresh view
      UIService.showToast(`تم إضافة ${addedCount} طالب جديد`, 'success');
    } else {
      UIService.showToast('كل الطلاب مطابقون ومسجلون بالفعل', 'info');
    }
  }
};
