import { supabase } from '../core/supabase.js';

export const StorageService = {
  async getStudents() {
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
  async upsertStudent(student) {
    const { data, error } = await supabase.from('students').upsert(student).select();
    if (error) throw error;
    return data[0];
  },
  async deleteStudent(id) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
  },

  async getGrades() {
    const { data, error } = await supabase.from('grades').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  },
  async upsertGrade(grade) {
    const { data, error } = await supabase.from('grades').upsert(grade).select();
    if (error) throw error;
    return data[0];
  },
  async deleteGrade(id) {
    const { error } = await supabase.from('grades').delete().eq('id', id);
    if (error) throw error;
  },

  async getCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, campaign_students(status)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    return data.map(c => {
      const statuses = c.statuses ? JSON.parse(c.statuses) : [];
      const successNames = statuses.filter(s => s.type === 'success').map(s => s.name || s);
      
      // If no success tags defined yet, use the classic defaults
      const effectiveSuccess = successNames.length ? successNames : ['إيجابي', 'اون لاين', 'اون لاين موعد'];

      return {
        ...c,
        totalStudents: c.campaign_students?.length || 0,
        successStudents: (c.campaign_students || []).filter(cs => effectiveSuccess.includes(cs.status)).length
      };
    });
  },
  async upsertCampaign(campaign) {
    const { data, error } = await supabase.from('campaigns').upsert(campaign).select();
    if (error) throw error;
    return data[0];
  },
  async deleteCampaign(id) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
  },

  async getCampaignStudents(campaignId) {
    const { data, error } = await supabase.from('campaign_students').select('*').eq('campaign_id', campaignId);
    if (error) return [];
    return data;
  },
  async upsertCampaignStudent(entry) {
    const { error } = await supabase.from('campaign_students').upsert(entry);
    if (error) throw error;
  },

  async getLogs() {
    const { data, error } = await supabase.from('audit_logs').select('*, profiles(full_name, email)').order('created_at', { ascending: false }).limit(100);
    if (error) return [];

    return data;
  },

  async saveLog(log) {
    await supabase.from('audit_logs').insert(log);
  },

  async getProfiles() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return {};
    const profiles = {};
    data.forEach(p => { profiles[p.id] = p; });
    return profiles;
  },
  async upsertProfile(profile) {
    const { data, error } = await supabase.from('profiles').upsert(profile).select();
    if (error) throw error;
    return data[0];
  }
};
