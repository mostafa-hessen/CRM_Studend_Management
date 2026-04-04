import { CampaignModel } from '../models/campaignModel.js';
import { CampaignView } from '../views/campaignView.js';
import { StudentModel } from '../models/studentModel.js';
import { StudentController } from './studentController.js';
import { StateManager } from '../core/state.js';
import { UIService } from '../services/uiService.js';
import { StorageService } from '../services/storageService.js';
import { ClassModel } from '../models/classModel.js';


let editingId = null;
let activeCampaignId = null;

export const CampaignController = {
  // Use state from core/state
  init(campaigns) {
    this.render();
  },

  render() {
    if (activeCampaignId) {
      const cmp = CampaignModel.getById(activeCampaignId);
      if (cmp) {
        this.handleViewCampaign(activeCampaignId);
        return;
      } else {
        activeCampaignId = null;
      }
    }
    CampaignView.renderList(CampaignModel.getAll(), ClassModel.getAll());
  },

  hideDetail() {
    activeCampaignId = null;
    this.render();
  },

  handleOpenAddModal() {
    editingId = null;
    CampaignView.showCampaignModal('إنشاء حملة جديدة', null, ClassModel.getAll());
  },


  handleOpenEditModal(id) {
    const campaign = CampaignModel.getById(id);
    if (!campaign) return;
    editingId = id;
    CampaignView.showCampaignModal('تعديل الحملة', campaign, ClassModel.getAll());
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
      UIService.showError(err);

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
      UIService.showError(err);

    }
  },

  handleOpenAddStudentModal(cid) {
    const campaign = CampaignModel.getById(cid);
    StudentController.handleOpenAddModal();
    StudentController.onStudentSavedCallback = async (student) => {
        const gradeMatch = !campaign.target_grade_id || student.grade_id === campaign.target_grade_id;
        const typeMatch = campaign.education_type === 'الكل' || student.education_type === campaign.education_type;
        
        if (!gradeMatch || !typeMatch) {
            const classObj = ClassModel.getById(campaign.target_grade_id);
            const targetGradeName = classObj ? classObj.name : (campaign.target_grade_id || 'الكل');
            UIService.showToast(`لا يمكن إضافة طالب للحملة لا يطابق المستهدف (الصف المستهدف: ${targetGradeName}، النوع: ${campaign.education_type})`, 'error');
            return;
        }

        try {
            await StorageService.upsertCampaignStudent({
            campaign_id: cid,
            student_id: student.id,
            status: 'لم يتم الاتصال',
            notes: '',
            followup_date: null
            });
            await CampaignModel.loadCampaignStudents(cid);
            this.handleViewCampaign(cid);
            UIService.showToast('تمت إضافة الطالب للحملة بنجاح', 'success');
        } catch(e) {
            UIService.showError(e);
        }
    };
  },

  async handleViewCampaign(id) {
    activeCampaignId = id;
    await CampaignModel.loadCampaignStudents(id);
    CampaignView.renderView(id, CampaignModel.getById(id), CampaignModel.getCampaignStudents(id), StudentModel.getAll(), ClassModel.getAll());
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
      const matchesGrade = !campaign.target_grade_id || s.grade_id === campaign.target_grade_id;
      const matchesType = campaign.education_type === 'الكل' || s.education_type === campaign.education_type;
      return matchesGrade && matchesType;
    });



    let addedCount = 0;
    for (const student of matches) {
      if (!studentsInCampaign.find(e => e.student_id === student.id)) {

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
