/**
 * Student Campaign Management System - Core App
 * @module assets/js/app
 */

import { Storage } from './modules/storage.js';
import { Auth } from './modules/auth.js';
import { UI } from './modules/ui.js';
import { Students } from './modules/students.js';
import { Campaigns } from './modules/campaigns.js';
import { Dashboard } from './modules/dashboard.js';
import { Classes } from './modules/classes.js';
import { Backup } from './modules/backup.js';

// ---- GLOBAL STATE ----
let state = {
  students: [],
  campaigns: [],
  campaignStudents: {},
  classes: [],
  nextStudentId: 1,
  nextCampaignId: 1,
  nextClassId: 1,
  activityLogs: [],
  appUsers: {}
};

let currentUser = null;
let editingStudentId = null;
let editingCampaignId = null;
let editingClassId = null;
let deletingStudentId = null;
let currentCampaignId = null;
let directoryHandle = null;

// ---- HELPER FUNCTIONS ----

function addLog(action, details) {
  if (!currentUser) return;
  const logEntry = {
    user: currentUser.name,
    username: currentUser.username,
    action: action,
    details: details,
    time: new Date().toLocaleString('ar-SA')
  };
  state.activityLogs.unshift(logEntry);
  if (state.activityLogs.length > 100) state.activityLogs.pop();
  Storage.saveLogs(state.activityLogs);
}

function updateStats() {
  const stats = {
    total: state.students.length,
    contacted: state.students.filter(s => s.status && s.status !== 'لم يرد' && s.status !== 'لم يتم تحديد الحالة').length,
    interested: state.students.filter(s => s.status === 'مهتم').length,
    registered: state.students.filter(s => s.status === 'تم التسجيل').length,
    noanswer: state.students.filter(s => s.status === 'لم يرد').length
  };
  Dashboard.renderStats(stats);
  
  // Update follow-up badge
  let totalFollowups = 0;
  state.campaigns.forEach(c => {
    const cs = state.campaignStudents[c.id] || [];
    totalFollowups += cs.filter(entry => 
      ['لم يرد', 'اتصل لاحقًا', 'متردد', 'مهتم'].includes(entry.status)
    ).length;
  });
  const badge = document.getElementById('followup-badge');
  if (badge) badge.textContent = totalFollowups;
}

// ---- PAGE RENDERING ----

function navigate(page) {
  const adminOnly = ['users', 'logs'];
  if (adminOnly.includes(page) && !Auth.isAdmin(currentUser)) {
    UI.showToast('عذراً، لا تملك صلاحية الوصول لهذه الصفحة', 'error');
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(page)) {
      n.classList.add('active');
    }
  });

  const pageTitle = document.getElementById('page-title');
  const pageTitles = {
    dashboard: 'لوحة التحكم',
    students: 'الطلاب',
    campaigns: 'الحملات',
    followups: 'المتابعات',
    reports: 'التقارير',
    classes: 'الصفوف الدراسية',
    guide: 'دليل الاستخدام',
    users: 'إدارة المستخدمين',
    logs: 'سجل النشاطات'
  };
  if (pageTitle) pageTitle.textContent = pageTitles[page] || '';

  // Render content
  switch(page) {
    case 'dashboard': renderDashboardPage(); break;
    case 'students': renderStudentsPage(); break;
    case 'campaigns': renderCampaignsPage(); break;
    case 'followups': renderFollowupsPage(); break;
    case 'reports': renderReportsPage(); break;
    case 'classes': renderClassesPage(); break;
    case 'users': renderUsersPage(); break;
    case 'logs': renderLogsPage(); break;
  }

  document.getElementById('sidebar').classList.remove('open');
}


function renderDashboardPage() {
  updateStats();
  const isAdmin = Auth.isAdmin(currentUser);
  const today = new Date().toISOString().slice(0, 10);
  let todayData = [];
  
  // Only show follow-ups for campaigns the user is assigned to
  const managedCampaigns = isAdmin 
    ? state.campaigns 
    : state.campaigns.filter(c => c.assignedEmployees && c.assignedEmployees.includes(currentUser.username));

  managedCampaigns.forEach(c => {
    const cs = state.campaignStudents[c.id] || [];
    cs.forEach(entry => {
      if (entry.status === 'لم يرد' || entry.status === 'اتصل لاحقًا' || entry.followupDate === today) {
        const s = state.students.find(x => x.id === entry.studentId);
        if (s) todayData.push({ ...s, campaignName: c.name, campaignStatus: entry.status });
      }
    });
  });
  
  Dashboard.renderTodayFollowups(todayData.slice(0, 10), 'today-table');
}

function renderStudentsPage() {
  Students.render(state.students, 'students-table');
}

function renderCampaignsPage() {
  document.getElementById('campaign-detail').classList.add('hidden');
  document.getElementById('campaigns-list').classList.remove('hidden');
  
  // Filter for non-admin users: only show campaigns where they are assigned
  const isAdmin = Auth.isAdmin(currentUser);
  const displayCampaigns = isAdmin 
    ? state.campaigns 
    : state.campaigns.filter(c => c.assignedEmployees && c.assignedEmployees.includes(currentUser.username));

  Campaigns.render(displayCampaigns, 'campaigns-list');
}

function renderFollowupsPage() {
  const tbody = document.getElementById('followups-table');
  const today = new Date().toISOString().slice(0, 10);
  let html = '';

  const isAdmin = Auth.isAdmin(currentUser);
  const managedCampaigns = isAdmin 
    ? state.campaigns 
    : state.campaigns.filter(c => c.assignedEmployees && c.assignedEmployees.includes(currentUser.username));

  managedCampaigns.forEach(c => {
    const cs = state.campaignStudents[c.id] || [];
    const campaignFollowups = cs.filter(entry => 
      ['لم يرد', 'اتصل لاحقًا', 'متردد', 'مهتم'].includes(entry.status)
    );

    if (campaignFollowups.length > 0) {
      html += `
        <tr class="bg-slate-50">
          <td colspan="6" class="py-2 px-4 font-bold text-slate-700 border-b border-t border-slate-200">
            <i class="fas fa-bullhorn ml-1 text-blue-500"></i> ${c.name}
          </td>
        </tr>
      `;
      
      campaignFollowups.forEach(entry => {
        const s = state.students.find(x => x.id === entry.studentId);
        if (!s) return;
        const isToday = entry.followupDate === today;
        html += `
          <tr class="${isToday ? 'bg-blue-50/40' : ''}">
            <td>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">${s.name[0]}</div>
                <div>
                  <p class="font-semibold text-sm">${s.name}</p>
                  ${isToday ? '<span class="text-xs text-blue-600 font-bold">اليوم!</span>' : ''}
                </div>
              </div>
            </td>
            <td><a href="tel:${s.phone}" class="text-blue-600 font-mono text-sm hover:underline">${s.phone}</a></td>
            <td>${UI.getStatusBadge(entry.status)}</td>
            <td class="text-sm text-slate-600 font-mono">${entry.followupDate || '—'}</td>
            <td class="text-sm text-slate-500 max-w-xs">${entry.notes || '—'}</td>
            <td>
              <a href="tel:${s.phone}" class="btn-primary py-1.5 px-4 text-xs inline-flex items-center gap-2">
                <i class="fas fa-phone text-xs"></i> اتصال
              </a>
            </td>
          </tr>
        `;
      });
    }
  });

  tbody.innerHTML = html || `<tr><td colspan="6" class="text-center py-10 text-slate-400">رائع! لا يوجد طلاب يحتاجون متابعة حالياً</td></tr>`;
}

function renderReportsPage() {
  const stats = {
    total: state.students.length,
    contacted: state.students.filter(s => s.status && s.status !== 'لم يرد' && s.status !== 'لم يتم تحديد الحالة').length,
    interested: state.students.filter(s => s.status === 'مهتم').length,
    registered: state.students.filter(s => s.status === 'تم التسجيل').length
  };

  document.getElementById('rep-calls').textContent = stats.contacted;
  document.getElementById('rep-reg').textContent = stats.registered;
  document.getElementById('rep-campaigns').textContent = state.campaigns.length;
  document.getElementById('rep-interested').textContent = stats.interested;

  const convPct = stats.total ? Math.round(stats.registered / stats.total * 100) : 0;
  const intPct = stats.total ? Math.round(stats.interested / stats.total * 100) : 0;
  const respPct = stats.total ? Math.round(stats.contacted / stats.total * 100) : 0;

  const kpis = document.querySelectorAll('#page-reports .progress-fill');
  if (kpis.length >= 3) {
    kpis[0].style.width = convPct + '%';
    kpis[0].parentElement.previousElementSibling.querySelector('p:last-child').textContent = convPct + '%';
    kpis[1].style.width = intPct + '%';
    kpis[1].parentElement.previousElementSibling.querySelector('p:last-child').textContent = intPct + '%';
    kpis[2].style.width = respPct + '%';
    kpis[2].parentElement.previousElementSibling.querySelector('p:last-child').textContent = respPct + '%';
  }

  document.getElementById('kpi-conv-text').textContent = `${stats.registered} مسجل من ${stats.total} طالب`;
  document.getElementById('kpi-int-text').textContent = `${stats.interested} مهتم من ${stats.total} طالب`;
  document.getElementById('kpi-resp-text').textContent = `${stats.contacted} مستجيب من ${stats.total} طالب`;

  // Status breakdown
  const statusGroups = {};
  state.students.forEach(x => { statusGroups[x.status] = (statusGroups[x.status] || 0) + 1; });
  const colorMap = {
    'مهتم': 'from-emerald-500 to-emerald-400',
    'متردد': 'from-amber-500 to-amber-400',
    'غير مهتم': 'from-red-500 to-red-400',
    'اتصل لاحقاً': 'from-purple-500 to-purple-400',
    'لم يرد': 'from-slate-400 to-slate-300',
    'تم التسجيل': 'from-blue-600 to-blue-400',
  };

  const container = document.getElementById('status-breakdown');
  container.innerHTML = Object.entries(statusGroups).map(([status, count]) => {
    const pct = Math.round(count / state.students.length * 100);
    return `
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">${UI.getStatusBadge(status)}</div>
          <span class="text-sm font-bold text-slate-700">${count} (${pct}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill bg-gradient-to-r ${colorMap[status] || 'from-blue-500 to-blue-400'}" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderClassesPage() {
  Classes.render(state.classes, state.students, 'classes-list');
  updateClassSelects();
}

function renderUsersPage() {
  const container = document.getElementById('users-list');
  let html = '';
  
  Object.entries(state.appUsers).forEach(([username, data]) => {
    html += `
      <div class="stat-card">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl"><i class="fas fa-user"></i></div>
          <div>
            <h3 class="font-bold text-lg text-slate-800">${data.name}</h3>
            <p class="text-xs text-slate-400 capitalize">${username}</p>
          </div>
          <span class="mr-auto badge ${username === 'wael' ? 'badge-registered' : 'badge-call-later'}">${data.role}</span>
        </div>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">اسم المستخدم</label>
              <input type="text" id="username-${username}" value="${username}" class="form-input mb-3"/>
            </div>
            <div>
              <label class="form-label">الاسم الكامل</label>
              <input type="text" id="name-${username}" value="${data.name}" class="form-input mb-3"/>
            </div>
          </div>
          <div>
            <label class="form-label">كلمة المرور</label>
            <div class="flex gap-2">
              <input type="text" id="pass-${username}" value="${data.pass}" class="form-input"/>
              <button onclick="updateUserInfo('${username}')" class="btn-primary">حفظ</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderLogsPage() {
  const container = document.getElementById('logs-table');
  container.innerHTML = state.activityLogs.length ? state.activityLogs.map(log => `
    <tr>
      <td class="whitespace-nowrap font-bold text-slate-700">${log.user}</td>
      <td class="whitespace-nowrap"><span class="badge ${log.action.includes('حذف') ? 'badge-not-interested' : 'badge-registered'}">${log.action}</span></td>
      <td class="text-sm text-slate-600">${log.details}</td>
      <td class="whitespace-nowrap text-xs font-mono text-slate-400">${log.time}</td>
    </tr>
  `).join('') : '<tr><td colspan="4" class="text-center py-10 text-slate-400">لا توجد نشاطات مسجلة</td></tr>';
}

// ---- APP INITIALIZATION ----

function init() {
  // Load Users
  state.appUsers = Storage.loadUsers() || Auth.getInitialUsers();
  state.activityLogs = Storage.loadLogs();
  
  // Check Auth
  currentUser = Auth.getCurrentUser();
  if (currentUser) {
    const freshData = state.appUsers[currentUser.username];
    if (freshData) currentUser = { ...currentUser, ...freshData };
    document.getElementById('login-overlay').style.display = 'none';
    applyPermissions();
  } else {
    document.getElementById('login-overlay').style.display = 'flex';
  }

  // Load Data
  const savedData = Storage.loadData();
  if (savedData) {
    state.students = savedData.students || [];
    state.campaigns = savedData.campaigns || [];
    state.classes = savedData.classes || [];
    state.campaignStudents = savedData.campaignStudents || {};
    state.nextStudentId = savedData.nextStudentId || 1;
    state.nextCampaignId = savedData.nextCampaignId || 1;
    state.nextClassId = savedData.nextClassId || 1;
  } else {
    // Default classes
    state.classes = [
      { id: 1, name: 'أولى إعدادي' },
      { id: 2, name: 'أولى ثانوي' },
      { id: 3, name: 'ثانية ثانوي' },
      { id: 4, name: 'ثالثة ثانوي' }
    ];
    state.nextClassId = 5;
  }

  setDate();
  updateClassSelects();
  updateStats();
  renderDashboardPage();

  // Attach login listener to fix ReferenceError
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', window.handleLogin);
  }
}

function setDate() {
  const el = document.getElementById('current-date');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}

function applyPermissions() {
  const isAdmin = Auth.isAdmin(currentUser);
  ['nav-reset', 'nav-users', 'nav-logs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isAdmin ? 'flex' : 'none';
  });

  const names = ['sidebar-user-name', 'topbar-user-name'];
  names.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = currentUser.name;
  });
}

function updateClassSelects() {
  ['s-class', 'filter-class'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.value;
    el.innerHTML = (id === 's-class' ? '<option value="">اختر الصف</option>' : '<option value="">جميع الصفوف</option>') + 
      state.classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    el.value = val;
  });
}

// ---- GLOBAL HANDLERS (for inline onclick compatibility) ----

window.handleLogin = () => {
  const userIn = document.getElementById('login-username').value.trim();
  const passIn = document.getElementById('login-password').value.trim();
  const user = Auth.login(userIn, passIn, state.appUsers);
  if (user) {
    currentUser = user;
    sessionStorage.setItem('logged_in_user', JSON.stringify(currentUser));
    document.getElementById('login-overlay').style.display = 'none';
    UI.showToast(`مرحباً بك ${user.name}`, 'success');
    addLog('تسجيل دخول', 'دخل إلى النظام');
    applyPermissions();
    navigate('dashboard');
  } else {
    UI.showToast('بيانات الدخول غير صحيحة', 'error');
  }
};

window.logout = () => {
  addLog('تسجيل خروج', 'خرج من النظام');
  Auth.logout();
  location.reload();
};

window.navigate = navigate;
window.toggleSidebar = UI.toggleSidebar;
window.openModal = UI.openModal;
window.closeModal = UI.closeModal;

window.saveStudent = () => {
  const name = document.getElementById('s-name').value.trim();
  const phone = document.getElementById('s-phone').value.trim();
  const parentPhone = document.getElementById('s-parent-phone').value.trim();
  const grade = document.getElementById('s-class').value;
  const educationType = document.getElementById('s-education-type').value;
  const school = document.getElementById('s-school').value.trim();
  const notes = document.getElementById('s-notes').value.trim();

  const data = { id: editingStudentId, name, phone, parentPhone, grade, educationType, school, notes };

  if (!Students.validate(data, state.students)) return;

  if (editingStudentId) {
    const idx = state.students.findIndex(s => s.id === editingStudentId);
    const oldName = state.students[idx].name;
    state.students[idx] = { ...state.students[idx], ...data };
    addLog('تعديل طالب', `عدل بيانات الطالب: ${oldName}`);
    UI.showToast('تم التحديث بنجاح', 'success');
  } else {
    data.id = state.nextStudentId++;
    data.status = 'لم يتم تحديد الحالة';
    state.students.push(data);
    addLog('إضافة طالب', `أضاف طالباً جديداً: ${data.name}`);
    
    // If adding from within a campaign flow
    if (currentCampaignId) {
      const campaign = state.campaigns.find(x => x.id === currentCampaignId);
      const customStatuses = campaign.statuses ? campaign.statuses.split(',').map(st => st.trim()) : [];
      if (!state.campaignStudents[currentCampaignId]) state.campaignStudents[currentCampaignId] = [];
      state.campaignStudents[currentCampaignId].push({
        studentId: data.id,
        status: customStatuses[0] || 'لم يتم تحديد الحالة',
        notes: '',
        followupDate: ''
      });
    }
    UI.showToast('تمت الإضافة بنجاح', 'success');
  }

  Storage.saveData(state);
  UI.closeModal('modal-student');
  renderStudentsPage();
  if (currentCampaignId) {
    Campaigns.renderCampaignStudents(currentCampaignId, state.campaigns, state.students, state.campaignStudents, 'campaign-students-table');
  }
  updateStats();
};

window.editStudent = (id) => {
  const s = state.students.find(x => x.id === id);
  if (!s) return;
  editingStudentId = id;
  document.getElementById('modal-student-title').textContent = 'تعديل بيانات الطالب';
  document.getElementById('s-name').value = s.name;
  document.getElementById('s-phone').value = s.phone;
  document.getElementById('s-parent-phone').value = s.parentPhone;
  document.getElementById('s-class').value = s.grade;
  document.getElementById('s-education-type').value = s.educationType || 'عام';
  document.getElementById('s-school').value = s.school;
  document.getElementById('s-notes').value = s.notes;
  UI.openModal('modal-student');
};

window.deleteStudent = (id) => {
  deletingStudentId = id;
  UI.openModal('modal-delete');
};

window.confirmDelete = () => {
  const s = state.students.find(x => x.id === deletingStudentId);
  if (s) {
    addLog('حذف طالب', `حذف الطالب: ${s.name}`);
    state.students = state.students.filter(x => x.id !== deletingStudentId);
    Object.keys(state.campaignStudents).forEach(cid => {
      state.campaignStudents[cid] = state.campaignStudents[cid].filter(x => x.studentId !== deletingStudentId);
    });
    Storage.saveData(state);
    renderStudentsPage();
    if (currentCampaignId) {
       Campaigns.renderCampaignStudents(currentCampaignId, state.campaigns, state.students, state.campaignStudents, 'campaign-students-table');
    }
    updateStats();
    UI.showToast('تم الحذف بنجاح', 'warning');
  }
  UI.closeModal('modal-delete');
};

window.openAddCampaignModal = () => {
  editingCampaignId = null;
  document.getElementById('modal-campaign-title').textContent = 'إنشاء حملة جديدة';
  document.getElementById('save-campaign-btn-text').textContent = 'إنشاء الحملة';
  document.getElementById('c-name').value = '';
  document.getElementById('c-target-grade').value = 'الكل';
  document.getElementById('c-education-type').value = 'الكل';
  document.getElementById('c-statuses').value = '';
  document.getElementById('c-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('c-notes').value = '';
  
  // Render employee checkboxes
  const empContainer = document.getElementById('campaign-employees-list');
  if (empContainer) {
    empContainer.innerHTML = Object.entries(state.appUsers)
      .map(([username, data]) => `
        <label class="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
          <input type="checkbox" name="c-emp" value="${username}" class="rounded text-blue-600 focus:ring-blue-500">
          <span class="text-xs text-slate-700">${data.name} ${username === 'wael' ? '(مدير)' : ''}</span>
        </label>
      `).join('');
  }
  UI.openModal('modal-campaign');
};

window.saveCampaign = () => {
  const name = document.getElementById('c-name').value.trim();
  const targetGrade = document.getElementById('c-target-grade').value;
  const educationType = document.getElementById('c-education-type').value;
  const statuses = document.getElementById('c-statuses').value.trim();
  const date = document.getElementById('c-date').value;
  const notes = document.getElementById('c-notes').value.trim();
  const assignedEmployees = Array.from(document.querySelectorAll('input[name="c-emp"]:checked')).map(cb => cb.value);

  if (!name) { UI.showToast('اسم الحملة مطلوب', 'error'); return; }

  if (editingCampaignId) {
    const idx = state.campaigns.findIndex(c => c.id === editingCampaignId);
    state.campaigns[idx] = { ...state.campaigns[idx], name, targetGrade, educationType, statuses, date, notes, assignedEmployees };
    addLog('تعديل حملة', `عدل بيانات الحملة: ${name}`);
    UI.showToast('تم التحديث بنجاح', 'success');
  } else {
    const newCampaign = { id: state.nextCampaignId++, name, targetGrade, educationType, statuses, date, notes, assignedEmployees };
    state.campaigns.push(newCampaign);
    state.campaignStudents[newCampaign.id] = [];
    addLog('إنشاء حملة', `أنشأ حملة جديدة باسم: ${name}`);
    UI.showToast('تم إنشاء الحملة بنجاح', 'success');
  }

  Storage.saveData(state);
  UI.closeModal('modal-campaign');
  renderCampaignsPage();
};

window.editCampaign = (id) => {
  const c = state.campaigns.find(x => x.id === id);
  if (!c) return;
  editingCampaignId = id;
  document.getElementById('modal-campaign-title').textContent = 'تعديل بيانات الحملة';
  document.getElementById('save-campaign-btn-text').textContent = 'تعديل الحملة';
  document.getElementById('c-name').value = c.name;
  document.getElementById('c-target-grade').value = c.targetGrade || 'الكل';
  document.getElementById('c-education-type').value = c.educationType || 'الكل';
  document.getElementById('c-statuses').value = c.statuses || '';
  document.getElementById('c-date').value = c.date;
  document.getElementById('c-notes').value = c.notes;
  
  // Render employee checkboxes and mark assigned ones
  const empContainer = document.getElementById('campaign-employees-list');
  if (empContainer) {
    empContainer.innerHTML = Object.entries(state.appUsers)
      .map(([username, data]) => `
        <label class="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
          <input type="checkbox" name="c-emp" value="${username}" 
            ${(c.assignedEmployees || []).includes(username) ? 'checked' : ''}
            class="rounded text-blue-600 focus:ring-blue-500">
          <span class="text-xs text-slate-700">${data.name} ${username === 'wael' ? '(مدير)' : ''}</span>
        </label>
      `).join('');
  }
  UI.openModal('modal-campaign');
};

window.deleteCampaign = (id) => {
  if (!confirm('هل أنت متأكد من حذف هذه الحملة؟ سيتم حذف جميع بيانات المتابعة بداخلها.')) return;
  const c = state.campaigns.find(x => x.id === id);
  addLog('حذف حملة', `حذف الحملة: ${c ? c.name : id}`);
  state.campaigns = state.campaigns.filter(c => c.id !== id);
  delete state.campaignStudents[id];
  Storage.saveData(state);
  renderCampaignsPage();
  updateStats();
  UI.showToast('تم حذف الحملة بنجاح', 'warning');
};

window.viewCampaign = (id) => {
  currentCampaignId = id;
  const c = state.campaigns.find(x => x.id === id);
  document.getElementById('campaigns-list').classList.add('hidden');
  document.getElementById('campaign-detail').classList.remove('hidden');
  document.getElementById('campaign-detail-name').textContent = c.name;
  document.getElementById('campaign-detail-date').textContent = c.date;
  Campaigns.renderCampaignStudents(id, state.campaigns, state.students, state.campaignStudents, 'campaign-students-table');
};

window.updateCampaignStudentStatus = (cid, sid, val) => {
  const entry = state.campaignStudents[cid]?.find(x => x.studentId === sid);
  if (entry) {
    entry.status = val;
    const s = state.students.find(x => x.id === sid);
    if (s) {
      s.status = val;
      addLog('تعديل حالة طالب', `عدل حالة ${s.name} إلى ${val}`);
    }
    Storage.saveData(state);
    updateStats();
    UI.showToast('تم تحديث الحالة', 'success');
  }
};

window.updateCampaignStudentFollowupDate = (cid, sid, val) => {
  const entry = state.campaignStudents[cid]?.find(x => x.studentId === sid);
  if (entry) {
    entry.followupDate = val;
    Storage.saveData(state);
    UI.showToast('تم تحديث تاريخ المتابعة', 'success');
  }
};

window.updateCampaignStudentNotes = (cid, sid, val) => {
  const entry = state.campaignStudents[cid]?.find(x => x.studentId === sid);
  if (entry) {
    entry.notes = val;
    Storage.saveData(state);
  }
};

window.addAllStudentsToCampaign = (cid) => {
  const campaign = state.campaigns.find(x => x.id === cid);
  if (!campaign) return;
  
  const existingIds = (state.campaignStudents[cid] || []).map(x => x.studentId);
  const newEntries = state.students.filter(s => {
    if (existingIds.includes(s.id)) return false;
    const gradeMatch = !campaign.targetGrade || campaign.targetGrade === 'الكل' || s.grade === campaign.targetGrade;
    const typeMatch = !campaign.educationType || campaign.educationType === 'الكل' || s.educationType === campaign.educationType;
    return gradeMatch && typeMatch;
  }).map(s => ({
    studentId: s.id,
    status: campaign.statuses ? campaign.statuses.split(',')[0].trim() : 'لم يتم تحديد الحالة',
    notes: '',
    followupDate: ''
  }));
  
  state.campaignStudents[cid] = [...(state.campaignStudents[cid] || []), ...newEntries];
  Storage.saveData(state);
  Campaigns.renderCampaignStudents(cid, state.campaigns, state.students, state.campaignStudents, 'campaign-students-table');
  UI.showToast(`تم إضافة ${newEntries.length} طالب إلى الحملة`, 'success');
};

window.syncMissingStudents = () => {
  if (currentCampaignId) window.addAllStudentsToCampaign(currentCampaignId);
};

window.openAddStudentToCampaignModal = () => {
  const campaign = state.campaigns.find(x => x.id === currentCampaignId);
  window.openAddStudentModal();
  if (campaign) {
    if (campaign.targetGrade && campaign.targetGrade !== 'الكل') {
      document.getElementById('s-class').value = campaign.targetGrade;
    }
    if (campaign.educationType && campaign.educationType !== 'الكل') {
      document.getElementById('s-education-type').value = campaign.educationType;
    }
  }
};

window.hideCampaignDetail = () => {
  document.getElementById('campaign-detail').classList.add('hidden');
  document.getElementById('campaigns-list').classList.remove('hidden');
  currentCampaignId = null;
};

window.openAddStudentModal = () => {
  editingStudentId = null;
  document.getElementById('modal-student-title').textContent = 'إضافة طالب جديد';
  ['s-name','s-phone','s-parent-phone','s-class','s-school','s-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  UI.openModal('modal-student');
};

window.addClass = () => {
  const name = document.getElementById('new-class-name').value.trim();
  if (!name) return;
  state.classes.push({ id: state.nextClassId++, name });
  document.getElementById('new-class-name').value = '';
  Storage.saveData(state);
  renderClassesPage();
};

window.editClass = (id) => {
  const c = state.classes.find(x => x.id === id);
  if (!c) return;
  const newName = prompt('تعديل اسم الصف:', c.name);
  if (newName && newName.trim() && newName.trim() !== c.name) {
    const oldName = c.name;
    c.name = newName.trim();
    state.students.forEach(s => { if (s.grade === oldName) s.grade = c.name; });
    Storage.saveData(state);
    renderClassesPage();
    UI.showToast('تم تحديث الصف والطلاب المرتبطين به', 'success');
  }
};

window.deleteClass = (id) => {
  if (!confirm('هل أنت متأكد من حذف هذا الصف؟ لن يتم حذف الطلاب ولكن سيتم مسح اسم الصف من بياناتهم.')) return;
  state.classes = state.classes.filter(c => c.id !== id);
  Storage.saveData(state);
  renderClassesPage();
};

window.selectBackupFolder = async () => {
  try {
    directoryHandle = await window.showDirectoryPicker();
    UI.showToast('تم تحديد مجلد الحفظ بنجاح', 'success');
  } catch (err) {
    if (err.name !== 'AbortError') UI.showToast('حدث خطأ أو المتصفح لا يدعم هذه الخاصية', 'error');
  }
};

window.exportToJSON = () => Backup.exportToJSON(state, directoryHandle);
window.exportToExcel = () => Backup.exportToExcel(state, directoryHandle);
window.importFromJSON = (input) => {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && (data.students || data.campaigns)) {
        if (confirm('سيتم استبدال جميع البيانات الحالية بالبيانات المستوردة. هل أنت متأكد؟')) {
          localStorage.setItem('student_system_data', e.target.result);
          UI.showToast('تم الاستيراد بنجاح، جارٍ التحديث...', 'success');
          setTimeout(() => location.reload(), 1000);
        }
      }
    } catch (err) { UI.showToast('ملف غير صالح', 'error'); }
  };
  reader.readAsText(file);
};

window.filterStudents = (val) => {
  const filtered = val ? state.students.filter(s =>
    s.name.includes(val) || s.phone.includes(val) || s.school?.includes(val)
  ) : state.students;
  Students.render(filtered, 'students-table');
};

window.filterByClass = (val) => {
  const filtered = val ? state.students.filter(s => s.grade === val) : state.students;
  Students.render(filtered, 'students-table');
};

window.updateUserInfo = (oldUsername) => {
  const newUsername = document.getElementById(`username-${oldUsername}`).value.trim().toLowerCase();
  const newName = document.getElementById(`name-${oldUsername}`).value.trim();
  const newPass = document.getElementById(`pass-${oldUsername}`).value.trim();
  
  if (!newUsername || !newName || !newPass) { UI.showToast('يرجى ملء جميع الحقول', 'error'); return; }
  if (newUsername !== oldUsername && state.appUsers[newUsername]) { UI.showToast('اسم المستخدم مأخوذ', 'error'); return; }
  
  const userData = { ...state.appUsers[oldUsername], name: newName, pass: newPass };
  if (newUsername !== oldUsername) {
    delete state.appUsers[oldUsername];
    state.appUsers[newUsername] = userData;
  } else {
    state.appUsers[oldUsername] = userData;
  }
  
  Storage.saveUsers(state.appUsers);
  UI.showToast('تم التحديث بنجاح', 'success');
  if (currentUser.username === oldUsername) {
    currentUser = { ...currentUser, ...userData, username: newUsername };
    sessionStorage.setItem('logged_in_user', JSON.stringify(currentUser));
    applyPermissions();
  }
  renderUsersPage();
};

// Initialize
document.addEventListener('DOMContentLoaded', init);

