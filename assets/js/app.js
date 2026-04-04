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

let deletingEntityType = 'student';
let deletingEntityId = null;

window.UI = UIService;
window.navigate = (page) => Router.navigate(page, StateManager.getCurrentUser(), PageRenderers);
window.toggleSidebar = UIService.toggleSidebar;
window.openModal = UIService.openModal;
window.closeModal = UIService.closeModal;
window.logout = () => AuthService.logout();

const PageRenderers = {
  dashboard: () => DashboardController.render(),
  students: () => StudentController.render(),
  campaigns: () => CampaignController.render(),
  followups: () => FollowupController.render(),
  reports: () => ReportController.render(),
  classes: () => ClassController.render(),
  users: () => UserController.render(),
  logs: () => LogController.render(),
  guide: () => {}
};

async function init() {
  try {
    UIService.showToast('جاري تحميل البيانات من السحاب...', 'info');
    await StateManager.loadPersistentData();
    
    const user = await AuthService.getCurrentUser();
    if (user) {
      StateManager.setCurrentUser(user);
      document.getElementById('login-overlay').style.display = 'none';
      applyPermissions();
      
      const state = StateManager.getState();
      StudentController.init(state.students);
      ClassController.init(state.classes);
      CampaignController.init(state.campaigns);
      await UserController.init();

      
      window.navigate('dashboard');
    } else {
      document.getElementById('login-overlay').style.display = 'flex';
    }

    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    StateManager.setupRealtime();
    StateManager.subscribe(() => {
        Router.renderCurrentPage(StateManager.getCurrentUser(), PageRenderers);
    });
    
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => preloader.classList.add('hidden'), 500);
    }
    
  } catch (err) {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
    UIService.showError(err, 'فشل الاتصال بـn. يرجى التأكد من إعدادات الاتصال.');
  }

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

  const name = user?.name || user?.username || user?.full_name || 'مستخدم';
  const role = user?.role === 'admin' || user?.role === 'مدير النظام' ? 'مدير النظام' : 'موظف';

  ['sidebar-user-name', 'topbar-user-name'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = name;
  });

  const sidebarRole = document.getElementById('sidebar-user-role');
  if(sidebarRole) sidebarRole.textContent = role;

  // Set avatar or initial letter avatar
  const initials = name.substring(0, 1).toUpperCase();
  const avatarUrl = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=2563eb&color=fff&size=40`;

  ['sidebar-user-avatar', 'topbar-user-avatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.src = avatarUrl;
      el.onerror = function() {
        this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=2563eb&color=fff&size=40`;
      };
    }
  });

  document.querySelectorAll('.hidden-user-element').forEach(el => {
    el.classList.toggle('hidden', !isAdmin);
  });
}

window.handleLogin = async () => {
    const email = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    
    UIService.showToast('جاري تسجيل الدخول...', 'info');
    try {
        const user = await AuthService.login(email, p); 
        
        if (user) {
          StateManager.setCurrentUser(user);
          document.getElementById('login-overlay').style.display = 'none';
          UIService.showToast(`مرحباً بك ${user.full_name || user.email}`, 'success');
          await StateManager.addLog('تسجيل دخول', 'دخل إلى النظام');
          applyPermissions();
          
          const state = StateManager.getState();
          StudentController.init(state.students);
          ClassController.init(state.classes);
          CampaignController.init(state.campaigns);
          await UserController.init();

          
          window.navigate('dashboard');
        }
    } catch (err) {
      UIService.showError(err);
    }
};

window.saveAppUser = () => UserController.handleSave();
window.openAddUserModal = () => UserController.handleOpenAddModal();
window.openEditUserModal = (un) => UserController.handleOpenEditModal(un);
window.deleteAppUser = (un) => UserController.handleDelete(un);
window.changeAppUserPassword = (un) => UserController.handleChangePassword(un);

window.saveStudent = () => StudentController.handleSave();
window.editStudent = (id) => StudentController.handleOpenEditModal(id);
window.deleteStudent = (id) => { 
    deletingEntityId = id; deletingEntityType = 'student';
    UIService.openModal('modal-delete'); 
};
window.openAddStudentModal = () => StudentController.handleOpenAddModal();
window.filterStudents = () => {
    const q = document.getElementById('search-student-query')?.value || '';
    const c = document.getElementById('filter-class')?.value || '';
    const e = document.getElementById('filter-education')?.value || '';
    StudentController.handleFilter(q, c, e);
};

window.openAddCampaignModal = () => CampaignController.handleOpenAddModal();
window.editCampaign = (id) => CampaignController.handleOpenEditModal(id);
window.saveCampaign = () => CampaignController.handleSave();
window.viewCampaign = (id) => CampaignController.handleViewCampaign(id);
window.filterCampaigns = () => {
    const q = document.getElementById('search-campaign-query').value.toLowerCase();
    const cards = document.querySelectorAll('#campaigns-list > div');
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = title.includes(q) ? '' : 'none';
    });
};
window.filterCampaignStudents = () => {
    const q = document.getElementById('search-campaign-student-query').value.toLowerCase();
    const status = document.getElementById('filter-campaign-student-status').value;
    const rows = document.querySelectorAll('#campaign-detail table tbody tr');
    
    rows.forEach(row => {
        const name = row.querySelector('td:first-child p:first-child')?.textContent.toLowerCase() || '';
        const phone = row.querySelector('td:nth-child(2) a')?.textContent || '';
        const rowStatus = row.querySelector('td:nth-child(3) select')?.value || '';
        
        const matchesQuery = name.includes(q) || phone.includes(q);
        const matchesStatus = !status || rowStatus === status;
        
        row.style.display = (matchesQuery && matchesStatus) ? '' : 'none';
    });
};
window.addCampaignStatusTag = () => CampaignController.addStatusTag(document.getElementById('c-new-status').value.trim());
window.removeCampaignStatusTag = (tag) => CampaignController.removeStatusTag(tag);
window.hideCampaignDetail = () => CampaignController.hideDetail();
window.updateCampaignStudentStatus = (cid, sid, status) => CampaignController.updateStudentStatus(cid, sid, status);
window.updateCampaignStudentFollowupDate = (cid, sid, date) => CampaignController.updateStudentFollowup(cid, sid, date);
window.updateCampaignStudentNotes = (cid, sid, notes) => CampaignController.updateStudentNotes(cid, sid, notes);
window.syncMissingStudents = (cid) => CampaignController.syncMissingStudents(cid);
window.openAddStudentCampaignModal = (cid) => CampaignController.handleOpenAddStudentModal(cid);

window.openAddClassModal = () => ClassController.handleOpenAddModal();
window.editClass = (id) => ClassController.handleOpenEditModal(id);
window.saveClass = () => ClassController.handleSave();
window.deleteClass = (id) => { deletingEntityId = id; deletingEntityType = 'class'; UIService.openModal('modal-delete'); };

window.confirmDelete = async () => {
    UIService.setBtnLoading('btn-confirm-delete', 'جاري الحذف...');
    try {
        if (deletingEntityType === 'student') await StudentController.handleDelete(deletingEntityId);
        else if (deletingEntityType === 'campaign') await CampaignController.handleDelete(deletingEntityId);
        else if (deletingEntityType === 'class') await ClassController.handleDelete(deletingEntityId);
        UIService.showToast('تم الحذف بنجاح', 'success');
        UIService.closeModal('modal-delete');
    } catch (err) {
        UIService.showError(err);
    } finally {
        UIService.clearBtnLoading('btn-confirm-delete');
    }
};

window.resetApp = () => UIService.openModal('modal-reset');
window.confirmReset = () => { localStorage.clear(); window.location.reload(); };

init();
