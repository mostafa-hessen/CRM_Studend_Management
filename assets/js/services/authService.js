/**
 * Auth Service - User Security Layer (Supabase Implementation)
 */
import { supabase } from '../core/supabase.js';
import { StateManager } from '../core/state.js';

export const AuthService = {
  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    // Fetch profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    return {
      id: session.user.id,
      email: session.user.email,
      ...profile
    };
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    const profile = await this.getCurrentUser();
    return profile;
  },

  async logout() {
    await StateManager.addLog('تسجيل خروج', 'خرج من النظام');
    await supabase.auth.signOut();
    location.reload();
  },

  isAdmin(user) {
    return user && (user.role === 'admin' || user.role === 'مدير النظام');
  }
};
