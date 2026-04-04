import { StateManager } from '../core/state.js';
import { supabase } from '../core/supabase.js';

export const UserModel = {
  getAll() {
    return StateManager.getState().profiles || [];
  },

  getById(id) {
    return this.getAll().find(p => p.id === id);
  },

  async loadAll() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    StateManager.getState().profiles = data;
    return data;
  },

  async save(userData, id = null) {
    if (id) {
      // Update existing user via RPC
      const { error } = await supabase.rpc('admin_update_user', {
        p_user_id: id,
        p_email: userData.email,
        p_full_name: userData.name,
        p_role: userData.role || 'موظف',
        p_password: userData.pass || null,
        p_status: userData.status || 'نشط'
      });
      if (error) throw error;
    } else {
      // Create new user via RPC
      const { error } = await supabase.rpc('admin_create_user', {
        p_email: userData.email,
        p_password: userData.pass,
        p_full_name: userData.name,
        p_role: userData.role || 'موظف'
      });
      if (error) throw error;
    }
    await this.loadAll(); // Reload profiles after mutation
  },

  async delete(id) {
    const { error } = await supabase.rpc('admin_delete_user', { p_user_id: id });
    if (error) throw error;
    await this.loadAll();
  }
};
