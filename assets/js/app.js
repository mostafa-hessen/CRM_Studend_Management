/**
 * Student Campaign Management System - Core App (Orchestrator)
 */

import { Storage } from './modules/storage.js';
import { Auth } from './modules/auth.js';
import { UI } from './modules/ui.js';
import { Students } from './modules/students.js';
import { Campaigns } from './modules/campaigns.js';
import { Dashboard } from './modules/dashboard.js';
import { Classes } from './modules/classes.js';
import { Backup } from './modules/backup.js';
import { UserManagement } from './modules/users.js';

import { StateManager } from './core/state.js';
import { Router } from './core/router.js';

// ---- UI STATE ----
let editingStudentId = null;
let deletingStudentId = null;
let editingCampaignId = null;
let editingClassId = null;
let currentCampaignId = null;
let currentCampaignStatuses = [];

// ---- GLOBAL MAPPINGS FOR INLINE HTML ----
window.UI = UI;
window.navigate = (page) => Router.navigate(page, StateManager.getCurrentUser(), PageRenderers);
window.toggleSidebar = UI.toggleSidebar;
window.openModal = UI.openModal;
window.closeModal = UI.closeModal;
window.logout = () => { StateManager.addLog('تسجيل خروج', 'خرج من النظام'); Auth.logout(); location.reload(); };

// ---- PAGE RENDERERS ----
const PageRenderers = {
  dashboard: () => {
    const state = StateManager.getState();
    const stats = Dashboard.calculateStats(state);
    Dashboard.renderStats(stats);
    
    // Update followup badge
    const badge = document.getElementById('followup-badge');
    if (badge) badge.textContent = stats.followups;

    // Render Today's Followups
    const isAdmin = Auth.isAdmin(StateManager.getCurrentUser());
    const today = new Date().toISOString().slice(0, 10);
    let todayData = [];
    const managedCampaigns = isAdmin ? state.campaigns : state.campaigns.filter(c => c.assignedEmployees?.includes(StateManager.getCurrentUser().username));

    managedCampaigns.forEach(c => {
      (state.campaignStudents[c.id] || []).forEach(entry => {
        if (entry.status === 'لم يرد' || entry.status === 'اتصل لاحقًا' || entry.followupDate === today) {
          const s = state.students.find(x => x.id === entry.studentId);
          if (s) todayData.push({ ...s, campaignName: c.name, campaignStatus: entry.status });
        }
      });
    });
    Dashboard.renderTodayFollowups(todayData.slice(0, 10), 'today-table');
  },

  students: () => Students.render(StateManager.getState().students, 'students-table'),

  campaigns: () => {
    const state = StateManager.getState();
    const isAdmin = Auth.isAdmin(StateManager.getCurrentUser());
    const displayCampaigns = isAdmin ? state.campaigns : state.campaigns.filter(c => c.assignedEmployees?.includes(StateManager.getCurrentUser().username));
    
    document.getElementById('campaign-detail').classList.add('hidden');
    document.getElementById('campaigns-list').classList.remove('hidden');
    Campaigns.render(displayCampaigns, state.campaignStudents, 'campaigns-list');
  },

  followups: () => renderFollowupsPage(), // Logic below for now to avoid bloating core
  reports: () => renderReportsPage(),
  classes: () => { Classes.render(StateManager.getState().classes, StateManager.getState().students, 'classes-list'); updateClassSelects(); },
  users: () => UserManagement.render(StateManager.getState().appUsers),
  logs: () => renderLogsPage()
};

// ---- INITIALIZATION ----
function init() {
  StateManager.loadPersistentData();
  
  const state = StateManager.getState();
  if (!state.appUsers || Object.keys(state.appUsers).length === 0) {
    state.appUsers = Auth.getInitialUsers();
  }
  
  const user = Auth.getCurrentUser();
  if (user) {
    const state = StateManager.getState();
    const freshData = state.appUsers[user.username] || user;
    StateManager.setCurrentUser({ ...user, ...freshData });
    document.getElementById('login-overlay').style.display = 'none';
    applyPermissions();
    window.navigate('dashboard');
  } else {
    document.getElementById('login-overlay').style.display = 'flex';
  }

  setDate();
  updateClassSelects();

  // Global UI Listeners
  document.getElementById('login-btn')?.addEventListener('click', window.handleLogin);
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', (e) => { if (e.target === ov) UI.closeModal(ov.id); });
  });
}

function applyPermissions() {
  const isAdmin = Auth.isAdmin(StateManager.getCurrentUser());
  ['nav-reset', 'nav-users', 'nav-logs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isAdmin ? 'flex' : 'none';
  });

  const name = StateManager.getCurrentUser()?.name;
  ['sidebar-user-name', 'topbar-user-name'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = name;
  });

  document.querySelectorAll('.hidden-user-element').forEach(el => {
    el.classList.toggle('hidden', !isAdmin);
  });
}

function setDate() {
  const el = document.getElementById('current-date');
  if (el) el.textContent = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function updateClassSelects() {
    const classes = StateManager.getState().classes;
    ['s-class', 'filter-class', 'c-target-grade'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const placeholder = id === 's-class' ? 'اختر الصف' : (id === 'filter-class' ? 'جميع الصفوف' : 'الكل');
      el.innerHTML = `<option value="${id === 'c-target-grade' ? 'الكل' : ''}">${placeholder}</option>` + 
        classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    });
}

// ---- AUTH & USER HANDLERS ----
window.handleLogin = () => {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    const user = Auth.login(u, p, StateManager.getState().appUsers);
    if (user) {
      StateManager.setCurrentUser(user);
      sessionStorage.setItem('logged_in_user', JSON.stringify(user));
      document.getElementById('login-overlay').style.display = 'none';
      UI.showToast(`مرحباً بك ${user.name}`, 'success');
      StateManager.addLog('تسجيل دخول', 'دخل إلى النظام');
      applyPermissions();
      window.navigate('dashboard');
    } else {
      UI.showToast('بيانات الدخول غير صحيحة', 'error');
    }
};

let editingAppUsername = null;

window.openAddUserModal = () => {
    editingAppUsername = null;
    document.getElementById('modal-user-title').textContent = 'إضافة موظف جديد';
    document.getElementById('u-name').value = '';
    document.getElementById('u-username').value = '';
    document.getElementById('u-username').disabled = false;
    document.getElementById('u-phone').value = '';
    document.getElementById('u-password').value = '';
    UI.openModal('modal-add-user');
};

window.openEditUserModal = (un) => {
    editingAppUsername = un;
    const u = StateManager.getState().appUsers[un];
    document.getElementById('modal-user-title').textContent = 'تعديل بيانات الموظف';
    document.getElementById('u-name').value = u.name;
    document.getElementById('u-username').value = un;
    document.getElementById('u-username').disabled = true;
    document.getElementById('u-phone').value = u.phone || '';
    document.getElementById('u-password').value = ''; // Optional on edit
    UI.openModal('modal-add-user');
};

window.saveAppUser = () => {
    const name = document.getElementById('u-name').value.trim();
    const un = document.getElementById('u-username').value.trim();
    const phone = document.getElementById('u-phone').value.trim();
    const pass = document.getElementById('u-password').value.trim();
    const isEdit = !!editingAppUsername;
    
    if (UserManagement.saveUser(name, isEdit ? editingAppUsername : un, phone, pass, isEdit)) {
        UI.closeModal('modal-add-user');
        PageRenderers.users();
    }
};

window.deleteAppUser = (un) => {
    if (UserManagement.deleteUser(un)) {
        PageRenderers.users();
    }
};

window.changeAppUserPassword = (un) => {
    if (UserManagement.changePassword(un)) {
        PageRenderers.users();
    }
};

// ... Remaining CRUD wrappers ...

// Boilerplate rendered directly for speed in this refactor
function renderFollowupsPage() {
    const state = StateManager.getState();
    const tbody = document.getElementById('followups-table');
    const isAdmin = Auth.isAdmin(StateManager.getCurrentUser());
    const managedCampaigns = isAdmin ? state.campaigns : state.campaigns.filter(c => c.assignedEmployees?.includes(StateManager.getCurrentUser().username));
    
    let html = '';
    managedCampaigns.forEach(c => {
        const cs = (state.campaignStudents[c.id] || []).filter(e => ['لم يرد', 'اتصل لاحقًا', 'متردد', 'مهتم'].includes(e.status));
        if (cs.length) {
            html += `<tr class="bg-slate-50"><td colspan="6" class="py-2 px-4 font-bold border-b border-slate-200">${c.name}</td></tr>`;
            cs.forEach(e => {
                const s = state.students.find(x => x.id === e.studentId);
                if (s) html += `<tr><td>${s.name}</td><td>${s.phone}</td><td>${UI.getStatusBadge(e.status)}</td><td>${e.followupDate || '—'}</td><td>${e.notes || '—'}</td><td><a href="tel:${s.phone}" class="btn-primary text-xs px-2 py-1">اتصال</a></td></tr>`;
            });
        }
    });
    tbody.innerHTML = html || '<tr><td colspan="6" class="text-center py-10">لا يوجد متابعات حالياً</td></tr>';
}

function renderReportsPage() {
    const state = StateManager.getState();
    const stats = Dashboard.calculateStats(state);
    document.getElementById('rep-calls').textContent = stats.contacted;
    document.getElementById('rep-reg').textContent = stats.registered;
    document.getElementById('rep-campaigns').textContent = state.campaigns.length;
    document.getElementById('rep-interested').textContent = stats.interested;
}

function renderLogsPage() {
    const container = document.getElementById('logs-table');
    const logs = StateManager.getState().activityLogs;
    container.innerHTML = logs.length ? logs.map(l => `<tr><td class="font-bold">${l.user}</td><td>${l.action}</td><td>${l.details}</td><td class="text-xs font-mono">${l.time}</td></tr>`).join('') : '<tr><td colspan="4">لا توجد نشاطات</td></tr>';
}

// --- Campaign Status Tag Handlers ---
window.addCampaignStatusTag = () => {
    const input = document.getElementById('c-new-status');
    const val = input.value.trim();
    if (!val || currentCampaignStatuses.includes(val)) return;
    currentCampaignStatuses.push(val);
    input.value = '';
    renderStatusTags();
};

window.removeCampaignStatusTag = (status) => {
    currentCampaignStatuses = currentCampaignStatuses.filter(s => s !== status);
    renderStatusTags();
};

function renderStatusTags() {
    const container = document.getElementById('c-status-tags');
    if (!container) return;
    container.innerHTML = currentCampaignStatuses.map(s => `
      <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-200">
        ${s}
        <button type="button" onclick="removeCampaignStatusTag('${s}')" class="hover:text-red-500 transition-colors">
          <i class="fas fa-times-circle"></i>
        </button>
      </span>
    `).join('');
}

// Start App
init();

// Exporting necessary functions for onclick handlers
window.deleteAppUser = (un) => {
    if (un === 'wael') return;
    if (!confirm('حذف الموظف؟')) return;
    const state = StateManager.getState();
    delete state.appUsers[un];
    StateManager.addLog('حذف موظف', `@${un}`);
    StateManager.save();
    PageRenderers.users();
};

window.promptChangePassword = (un) => {
    const pass = prompt('كلمة المرور الجديدة:');
    if (!pass) return;
    StateManager.getState().appUsers[un].password = pass;
    StateManager.addLog('تغيير باسورد', `@${un}`);
    StateManager.save();
    UI.showToast('تم التحديث', 'success');
};

window.resetApp = () => UI.openModal('modal-reset');
window.confirmReset = () => {
    localStorage.clear();
    window.location.reload();
};

// --- Student CRUD Bindings ---
window.saveStudent = () => {
    const state = StateManager.getState();
    const data = {
        name: document.getElementById('s-name').value.trim(),
        phone: document.getElementById('s-phone').value.trim(),
        parentPhone: document.getElementById('s-parent-phone').value.trim(),
        grade: document.getElementById('s-class').value,
        educationType: document.getElementById('s-education-type').value,
        school: document.getElementById('s-school').value.trim(),
        notes: document.getElementById('s-notes').value.trim()
    };

    if (Students.handleSave(state, editingStudentId, data, currentCampaignId, { addLog: StateManager.addLog })) {
        StateManager.save();
        UI.closeModal('modal-student');
        PageRenderers.students();
        UI.showToast(editingStudentId ? 'تم التحديث' : 'تمت الإضافة', 'success');
        if (currentCampaignId) window.viewCampaign(currentCampaignId);
    }
};

window.editStudent = (id) => {
    const s = StateManager.getState().students.find(x => x.id === id);
    if (!s) return;
    editingStudentId = id;
    document.getElementById('modal-student-title').textContent = 'تعديل بيانات الطالب';
    ['s-name', 's-phone', 's-parent-phone', 's-class', 's-education-type', 's-school', 's-notes'].forEach(fid => {
        const val = s[fid.replace('s-', '').replace('parent-phone', 'parentPhone')];
        document.getElementById(fid).value = val || '';
    });
    UI.openModal('modal-student');
};

window.deleteStudent = (id) => { deletingStudentId = id; UI.openModal('modal-delete'); };
window.confirmDelete = () => {
    const state = StateManager.getState();
    const s = state.students.find(x => x.id === deletingStudentId);
    if (s) {
        state.students = state.students.filter(x => x.id !== deletingStudentId);
        StateManager.addLog('حذف طالب', s.name);
        StateManager.save();
        PageRenderers.students();
        UI.showToast('تم الحذف', 'warning');
    }
    UI.closeModal('modal-delete');
};

window.openAddStudentModal = () => {
    editingStudentId = null;
    document.getElementById('modal-student-title').textContent = 'إضافة طالب جديد';
    ['s-name', 's-phone', 's-parent-phone', 's-school', 's-notes'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('s-class').innerHTML = Classes.renderOptions(StateManager.getState().classes);
    document.getElementById('s-education-type').value = 'عام';
    UI.openModal('modal-student');
};

// --- Campaign CRUD Bindings ---
window.openAddCampaignModal = () => {
    editingCampaignId = null;
    document.getElementById('modal-campaign-title').textContent = 'إنشاء حملة جديدة';
    document.getElementById('save-campaign-btn-text').textContent = 'إنشاء الحملة';
    ['c-name', 'c-notes', 'c-new-status'].forEach(id => { 
        const el = document.getElementById(id);
        if (el) el.value = ''; 
    });
    document.getElementById('c-target-grade').innerHTML = Classes.renderOptions(StateManager.getState().classes, true);
    document.getElementById('c-target-grade').value = 'الكل';
    document.getElementById('c-date').value = new Date().toISOString().slice(0, 10);
    currentCampaignStatuses = [];
    renderStatusTags();
    renderEmployeeCheckboxes([]);
    UI.openModal('modal-campaign');
};

window.saveCampaign = () => {
    const data = {
        name: document.getElementById('c-name').value.trim(),
        targetGrade: document.getElementById('c-target-grade').value,
        educationType: document.getElementById('c-education-type').value,
        statuses: currentCampaignStatuses.join(','),
        date: document.getElementById('c-date').value,
        notes: document.getElementById('c-notes').value.trim(),
        assignedEmployees: Array.from(document.querySelectorAll('input[name="c-emp"]:checked')).map(cb => cb.value)
    };

    if (Campaigns.handleSave(StateManager.getState(), editingCampaignId, data, { addLog: StateManager.addLog })) {
        StateManager.save();
        UI.closeModal('modal-campaign');
        PageRenderers.campaigns();
    }
};

function renderEmployeeCheckboxes(selected = []) {
    const cont = document.getElementById('campaign-employees-list');
    if (!cont) return;
    cont.innerHTML = Object.entries(StateManager.getState().appUsers).map(([un, d]) => `
        <label class="flex items-center gap-2 cursor-pointer p-1">
            <input type="checkbox" name="c-emp" value="${un}" ${selected.includes(un) ? 'checked' : ''} class="rounded text-blue-600">
            <span class="text-xs">${d.name}</span>
        </label>
    `).join('');
}

window.viewCampaign = (id) => {
    currentCampaignId = id;
    const c = StateManager.getState().campaigns.find(x => x.id === id);
    document.getElementById('campaigns-list').classList.add('hidden');
    document.getElementById('campaign-detail').classList.remove('hidden');
    document.getElementById('campaign-detail-name').textContent = c.name;
    Campaigns.renderCampaignStudents(id, StateManager.getState().campaigns, StateManager.getState().students, StateManager.getState().campaignStudents, 'campaign-students-table');
};

window.editCampaign = (id) => {
    const c = StateManager.getState().campaigns.find(x => x.id === id);
    if (!c) return;
    editingCampaignId = id;
    document.getElementById('modal-campaign-title').textContent = 'تعديل الحملة';
    document.getElementById('save-campaign-btn-text').textContent = 'تحديث الحملة';
    document.getElementById('c-target-grade').innerHTML = Classes.renderOptions(StateManager.getState().classes, true);
    document.getElementById('c-name').value = c.name;
    document.getElementById('c-target-grade').value = c.targetGrade;
    document.getElementById('c-education-type').value = c.educationType || 'الكل';
    document.getElementById('c-date').value = c.date;
    document.getElementById('c-notes').value = c.notes;
    currentCampaignStatuses = c.statuses.split(',').filter(s => s);
    renderStatusTags();
    renderEmployeeCheckboxes(c.assignedEmployees || []);
    UI.openModal('modal-campaign');
};

window.deleteCampaign = (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحملة وجميع بيانات التواصل المرتبطة بها؟')) return;
    const state = StateManager.getState();
    const c = state.campaigns.find(x => x.id === id);
    if (c) {
        state.campaigns = state.campaigns.filter(x => x.id !== id);
        delete state.campaignStudents[id];
        StateManager.addLog('حذف حملة', c.name);
        StateManager.save();
        PageRenderers.campaigns();
        UI.showToast('تم حذف الحملة بنجاح', 'warning');
    }
};

// --- Class CRUD Bindings ---
window.openAddClassModal = () => {
    editingClassId = null;
    document.getElementById('cl-name').value = '';
    UI.openModal('modal-class');
};

window.saveClass = () => {
    const state = StateManager.getState();
    const val = document.getElementById('cl-name').value.trim();
    if (Classes.handleSave(state, editingClassId, val, { addLog: StateManager.addLog })) {
        StateManager.save();
        UI.closeModal('modal-class');
        PageRenderers.classes();
    }
};

window.editClass = (id) => {
    editingClassId = id;
    const c = StateManager.getState().classes.find(x => x.id === id);
    if (c) {
        document.getElementById('cl-name').value = c.name;
        UI.openModal('modal-class');
    }
};

window.deleteClass = (id) => {
    if (!confirm('حذف الصف الدراسي سيؤدي لمسحه من بيانات الطلاب المرتبطين به. هل أنت متأكد؟')) return;
    const state = StateManager.getState();
    state.classes = state.classes.filter(x => x.id !== id);
    StateManager.save();
    PageRenderers.classes();
};

