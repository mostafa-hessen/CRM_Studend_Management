/**
 * Student Campaign Management System - Core App (Orchestrator)
 */

import { AuthService } from './services/authService.js';
import { UIService } from './services/uiService.js';
import { BackupService } from './services/backupService.js';

import { StudentController } from './controllers/studentController.js';
import { ClassController } from './controllers/classController.js';
import { CampaignController } from './controllers/campaignController.js';
import { DashboardController } from './controllers/dashboardController.js';
import { UserController } from './controllers/userController.js';
import { FollowupController } from './controllers/followupController.js';
import { ReportController } from './controllers/reportController.js';
import { LogController } from './controllers/logController.js';

import { StateManager } from './core/state.js';
import { Router } from './core/router.js';
import { UserModel } from './models/userModel.js';

// ---- UI STATE ----
let deletingEntityType = 'student'; // 'student' | 'campaign' | 'class'
let deletingEntityId = null;

// ---- GLOBAL MAPPINGS FOR INLINE HTML ----
window.UI = UIService;
window.navigate = (page) => Router.navigate(page, StateManager.getCurrentUser(), PageRenderers);
window.toggleSidebar = UIService.toggleSidebar;
window.openModal = UIService.openModal;
window.closeModal = UIService.closeModal;
window.logout = () => AuthService.logout();

// ---- PAGE RENDERERS ----
const PageRenderers = {
  dashboard: () => DashboardController.render(),
  students: () => StudentController.render(),
  campaigns: () => CampaignController.render(),
  followups: () => FollowupController.render(),
  reports: () => ReportController.render(),
  classes: () => ClassController.render(),
  users: () => UserController.render(),
  logs: () => LogController.render()
};

// ---- INITIALIZATION ----
async function init() {
  try {
    UIService.showToast('جاري تحميل البيانات من السحاب...', 'info');
    await StateManager.loadPersistentData();
    
    const user = AuthService.getCurrentUser();
    if (user) {
      StateManager.setCurrentUser(user);
      document.getElementById('login-overlay').style.display = 'none';
      applyPermissions();
      
      const state = StateManager.getState();
      StudentController.init(state.students);
      ClassController.init(state.classes);
      CampaignController.init(state.campaigns);
      
      window.navigate('dashboard');
    } else {
      document.getElementById('login-overlay').style.display = 'flex';
    }

    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // Enable Realtime
    StateManager.setupRealtime();
    StateManager.subscribe(() => {
        Router.renderCurrentPage(StateManager.getCurrentUser(), PageRenderers);
    });
    
  } catch (err) {
    UIService.showError(err, 'فشل الاتصال بـ Supabase. يرجى التأكد من إعدادات الاتصال.');
  }

  // Global UI Listeners
  document.getElementById('login-btn')?.addEventListener('click', window.handleLogin);
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', (e) => { if (e.target === ov) UIService.closeModal(ov.id); });
  });
}

function applyPermissions() {
  const user = StateManager.getCurrentUser();
  const isAdmin = AuthService.isAdmin(user);
  
  ['nav-reset', 'nav-users', 'nav-logs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isAdmin ? 'flex' : 'none';
  });

  const name = user?.name || user?.username;
  ['sidebar-user-name', 'topbar-user-name'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = name;
  });

  document.querySelectorAll('.hidden-user-element').forEach(el => {
    el.classList.toggle('hidden', !isAdmin);
  });
}

// ---- AUTH & USER HANDLERS ----
window.handleLogin = async () => {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    
    UIService.showToast('جاري تسجيل الدخول...', 'info');
    const user = AuthService.login(u, p, UserModel.getAll()); 
    
    if (user) {
      StateManager.setCurrentUser(user);
      sessionStorage.setItem('logged_in_user', JSON.stringify(user));
      document.getElementById('login-overlay').style.display = 'none';
      UIService.showToast(`مرحباً بك ${user.name}`, 'success');
      await StateManager.addLog('تسجيل دخول', 'دخل إلى النظام');
      applyPermissions();
      
      const state = StateManager.getState();
      StudentController.init(state.students);
      ClassController.init(state.classes);
      CampaignController.init(state.campaigns);
      
      window.navigate('dashboard');
    } else {
      UIService.showToast('بيانات الدخول غير صحيحة', 'error');
    }
};

// --- GLOBAL CRUD WRAPPERS ---

// Users
window.saveAppUser = () => UserController.handleSave();
window.openAddUserModal = () => UserController.handleOpenAddModal();
window.openEditUserModal = (un) => UserController.handleOpenEditModal(un);
window.deleteAppUser = (un) => UserController.handleDelete(un);
window.changeAppUserPassword = (un) => UserController.handleChangePassword(un);

// Students
window.saveStudent = () => StudentController.handleSave();
window.editStudent = (id) => StudentController.handleOpenEditModal(id);
window.deleteStudent = (id) => { 
    deletingEntityId = id; deletingEntityType = 'student';
    UIService.openModal('modal-delete'); 
};
window.openAddStudentModal = () => StudentController.handleOpenAddModal();

// Campaigns
window.openAddCampaignModal = () => CampaignController.handleOpenAddModal();
window.editCampaign = (id) => CampaignController.handleOpenEditModal(id);
window.saveCampaign = () => CampaignController.handleSave();
window.viewCampaign = (id) => CampaignController.handleViewCampaign(id);
window.addCampaignStatusTag = () => CampaignController.addStatusTag(document.getElementById('c-new-status').value.trim());
window.removeCampaignStatusTag = (tag) => CampaignController.removeStatusTag(tag);
window.hideCampaignDetail = () => CampaignController.render();
window.updateCampaignStudentStatus = (cid, sid, status) => CampaignController.updateStudentStatus(cid, sid, status);
window.updateCampaignStudentFollowupDate = (cid, sid, date) => CampaignController.updateStudentFollowup(cid, sid, date);
window.updateCampaignStudentNotes = (cid, sid, notes) => CampaignController.updateStudentNotes(cid, sid, notes);
window.syncMissingStudents = (cid) => CampaignController.syncMissingStudents(cid);

// Classes
window.openAddClassModal = () => ClassController.handleOpenAddModal();
window.editClass = (id) => ClassController.handleOpenEditModal(id);
window.saveClass = () => ClassController.handleSave();
window.deleteClass = (id) => { deletingEntityId = id; deletingEntityType = 'class'; UIService.openModal('modal-delete'); };

// Delete Confirmation
window.confirmDelete = async () => {
    UIService.setBtnLoading('btn-confirm-delete', 'جاري الحذف...');
    try {
        if (deletingEntityType === 'student') await StudentController.handleDelete(deletingEntityId);
        else if (deletingEntityType === 'campaign') await CampaignController.handleDelete(deletingEntityId);
        else if (deletingEntityType === 'class') await ClassController.handleDelete(deletingEntityId);
        UIService.showToast('تم الحذف بنجاح', 'success');
        UIService.closeModal('modal-delete');
    } catch (err) {
        UIService.showError(err, 'تعذر إتمام عملية الحذف.');
    } finally {
        UIService.clearBtnLoading('btn-confirm-delete');
    }
};

// Backup & Reset
window.resetApp = () => UIService.openModal('modal-reset');
window.confirmReset = () => { localStorage.clear(); window.location.reload(); };

init();
