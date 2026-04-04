import { StudentModel } from '../models/studentModel.js';
import { CampaignModel } from '../models/campaignModel.js';
import { DashboardView } from '../views/dashboardView.js';
import { StateManager } from '../core/state.js';
import { AuthService } from '../services/authService.js';

export const DashboardController = {
  render() {
    const students = StudentModel.getAll();
    const campaigns = CampaignModel.getAll();
    const campaignStudents = StateManager.getState().campaignStudents;

    const stats = {
      total: students.length,
      contacted: students.filter(s => s.status && s.status !== 'لم يرد' && s.status !== 'لم يتم تحديد الحالة').length,
      interested: students.filter(s => s.status === 'مهتم').length,
      registered: students.filter(s => s.status === 'تم التسجيل').length,
      noanswer: students.filter(s => s.status === 'لم يرد').length,
      followups: Object.keys(campaignStudents).reduce((acc, cid) => {
        return acc + campaignStudents[cid].filter(entry => 
          ['لم يرد', 'اتصل لاحقًا', 'متردد', 'مهتم'].includes(entry.status)
        ).length;
      }, 0)
    };

    DashboardView.renderStats(stats);
    this.renderTodayData(students, campaigns, campaignStudents);
  },

  renderTodayData(students, campaigns, campaignStudentsMap) {
    const isAdmin = AuthService.isAdmin(StateManager.getCurrentUser());
    const today = new Date().toISOString().slice(0, 10);
    let todayData = [];
    
    const managedCampaigns = isAdmin ? campaigns : campaigns.filter(c => c.assignedEmployees?.includes(StateManager.getCurrentUser().username));

    managedCampaigns.forEach(c => {
      (campaignStudentsMap[c.id] || []).forEach(entry => {
        if (entry.status === 'لم يرد' || entry.status === 'اتصل لاحقًا' || entry.followupDate === today) {
          const s = students.find(x => x.id === entry.studentId);
          if (s) todayData.push({ ...s, campaignName: c.name, campaignStatus: entry.status });
        }
      });
    });

    DashboardView.renderTodayFollowups(todayData.slice(0, 10));
  }
};
