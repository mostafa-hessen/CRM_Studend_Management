/**
 * Storage Service - Supabase Logic Layer
 */
import { supabase } from '../core/supabase.js';

export const StorageService = {
  // Students
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

  // Grades (Classes)
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

  // Campaigns
  async getCampaigns() {
    const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
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

  // Campaign Students
  async getCampaignStudents(campaignId) {
    const { data, error } = await supabase.from('campaign_students').select('*').eq('campaign_id', campaignId);
    if (error) return [];
    return data;
  },
  async upsertCampaignStudent(entry) {
    const { error } = await supabase.from('campaign_students').upsert(entry);
    if (error) throw error;
  },

  // Logs
  async getLogs() {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) return [];
    return data;
  },
  async saveLog(log) {
    const { error } = await supabase.from('audit_logs').insert(log);
    if (error) console.error('Error saving log:', error);
  },

  // Profiles
  async getProfiles() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return {};
    const profiles = {};
    data.forEach(p => { profiles[p.id] = p; });
    return profiles;
  }
};
