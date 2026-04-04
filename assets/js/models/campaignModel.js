import { StorageService } from '../services/storageService.js';
import { StateManager } from '../core/state.js';

export const CampaignModel = {
  getAll() {
    return StateManager.getState().campaigns || [];
  },

  getById(id) {
    return this.getAll().find(c => c.id === id);
  },

  async loadAll() {
    const campaigns = await StorageService.getCampaigns();
    StateManager.getState().campaigns = campaigns;
    return campaigns;
  },

  async loadCampaignStudents(campaignId) {
    const students = await StorageService.getCampaignStudents(campaignId);
    StateManager.getState().campaignStudents[campaignId] = students.map(cs => ({
      studentId: cs.student_id,
      status: cs.status,
      followupDate: cs.followup_date,
      notes: cs.notes
    }));
    return students;
  },

  async save(campaignData, id = null) {
    const campaign = id ? { id, ...campaignData } : campaignData;
    const saved = await StorageService.upsertCampaign(campaign);
    const campaigns = this.getAll();
    const idx = campaigns.findIndex(c => c.id === saved.id);
    if (idx !== -1) campaigns[idx] = saved;
    else campaigns.push(saved);
    StateManager.save();
    return saved;
  },

  async delete(id) {
    await StorageService.deleteCampaign(id);
    const state = StateManager.getState();
    state.campaigns = state.campaigns.filter(c => c.id !== id);
    delete state.campaignStudents[id];
    StateManager.save();
  },

  async updateStudentInCampaign(cid, sid, updates) {
    const studentsInCampaign = this.getCampaignStudents(cid);
    const entry = studentsInCampaign.find(e => e.studentId === sid);
    if (!entry) return;

    Object.assign(entry, updates);
    await StorageService.upsertCampaignStudent({
      campaign_id: cid,
      student_id: sid,
      status: entry.status,
      notes: entry.notes,
      followup_date: entry.followupDate
    });
    StateManager.save();
  },

  getCampaignStudents(cid) {
    return StateManager.getState().campaignStudents[cid] || [];
  }
};
