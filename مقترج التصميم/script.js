// ============================================
// Student Campaign Management System
// Arabic RTL - Full Interactive Prototype
// ============================================

// ---- STATE ----
let students = [
  { id: 1, name: 'أحمد محمد الزهراني', phone: '0501234567', parentPhone: '0509876543', grade: 'الصف العاشر', school: 'مدرسة الفيصل', notes: 'طالب متميز ومهتم بالمادة', status: 'مهتم', followupDate: '2026-03-14' },
  { id: 2, name: 'سارة عبدالله الغامدي', phone: '0502345678', parentPhone: '0508765432', grade: 'الصف الحادي عشر', school: 'ثانوية الرياض', notes: '', status: 'تم التسجيل', followupDate: '2026-03-10' },
  { id: 3, name: 'عمر خالد الشمري', phone: '0503456789', parentPhone: '0507654321', grade: 'الصف التاسع', school: 'مدرسة النور', notes: 'يحتاج وقتاً للتفكير', status: 'متردد', followupDate: '2026-03-15' },
  { id: 4, name: 'نورة سعد الدوسري', phone: '0504567890', parentPhone: '0506543210', grade: 'الصف الثاني عشر', school: 'ثانوية الأمل', notes: '', status: 'تم التسجيل', followupDate: '2026-03-08' },
  { id: 5, name: 'فيصل عبدالرحمن العتيبي', phone: '0505678901', parentPhone: '0505432109', grade: 'الصف العاشر', school: 'مدرسة الريادة', notes: 'لم يرد على المكالمة مرتين', status: 'لم يرد', followupDate: '2026-03-13' },
  { id: 6, name: 'لمى يوسف الحربي', phone: '0506789012', parentPhone: '0504321098', grade: 'الصف الحادي عشر', school: 'ثانوية البنات', notes: 'مهتمة جداً - اتصلي بها غداً', status: 'مهتم', followupDate: '2026-03-14' },
  { id: 7, name: 'تركي ناصر القحطاني', phone: '0507890123', parentPhone: '0503210987', grade: 'الصف التاسع', school: 'مدرسة الوفاء', notes: '', status: 'غير مهتم', followupDate: '' },
  { id: 8, name: 'منى إبراهيم البقمي', phone: '0508901234', parentPhone: '0502109876', grade: 'الصف الثاني عشر', school: 'ثانوية التميز', notes: 'طلبت المزيد من التفاصيل', status: 'اتصل لاحقًا', followupDate: '2026-03-16' },
  { id: 9, name: 'خالد سلطان الرشيدي', phone: '0509012345', parentPhone: '0501098765', grade: 'الصف العاشر', school: 'مدرسة الفجر', notes: '', status: 'تم التسجيل', followupDate: '2026-03-05' },
  { id: 10, name: 'هيا محمود الجهني', phone: '0500123456', parentPhone: '0500987654', grade: 'الصف الحادي عشر', school: 'ثانوية الإشراق', notes: '', status: 'مهتم', followupDate: '2026-03-14' },
  { id: 11, name: 'بدر علي الأسمري', phone: '0511234567', parentPhone: '0519876543', grade: 'الصف التاسع', school: 'مدرسة الرسالة', notes: 'لم يرد - حاول مرة ثانية', status: 'لم يرد', followupDate: '2026-03-13' },
  { id: 12, name: 'ريم عبدالعزيز السبيعي', phone: '0512345678', parentPhone: '0518765432', grade: 'الصف الثاني عشر', school: 'ثانوية النجاح', notes: '', status: 'تم التسجيل', followupDate: '2026-03-07' },
];

let campaigns = [
  { id: 1, name: 'حملة المراجعة النهائية', date: '2026-03-10', notes: 'التواصل مع الطلاب قبل الاختبارات النهائية', students: [] },
  { id: 2, name: 'حملة الفصل الثاني', date: '2026-03-15', notes: 'استهداف طلاب الصف الثاني عشر للتسجيل', students: [] },
];

let campaignStudents = {};
let nextStudentId = 1;
let nextCampaignId = 1;
let editingStudentId = null;
let deletingStudentId = null;
let filteredStudents = null;
let currentCampaignId = null;

// ---- STORAGE ----
function saveToStorage() {
  const data = {
    students,
    campaigns,
    campaignStudents,
    nextStudentId,
    nextCampaignId
  };
  localStorage.setItem('student_system_data', JSON.stringify(data));
}

function loadFromStorage() {
  const data = localStorage.getItem('student_system_data');
  if (data) {
    const parsed = JSON.parse(data);
    students = parsed.students || [];
    campaigns = parsed.campaigns || [];
    campaignStudents = parsed.campaignStudents || {};
    nextStudentId = parsed.nextStudentId || 1;
    nextCampaignId = parsed.nextCampaignId || 1;
    return true;
  }
  return false;
}

// Init campaign students
function initCampaignStudents() {
  campaigns.forEach(c => {
    if (!campaignStudents[c.id]) {
      campaignStudents[c.id] = students.map(s => ({ studentId: s.id, status: 'لم يرد', notes: '' }));
    }
  });
}

// ---- NAVIGATION ----
const pageTitles = {
  dashboard: 'لوحة التحكم',
  students: 'الطلاب',
  campaigns: 'الحملات',
  followups: 'المتابعات',
  reports: 'التقارير',
  guide: 'دليل الاستخدام'
};

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(page)) {
      n.classList.add('active');
    }
  });

  document.getElementById('page-title').textContent = pageTitles[page] || '';

  if (page === 'dashboard') renderDashboard();
  if (page === 'students') renderStudents();
  if (page === 'campaigns') renderCampaigns();
  if (page === 'followups') renderFollowups();
  if (page === 'reports') renderReports();

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ---- TOAST ----
function showToast(message, type = 'info') {
  const icons = { success: 'fa-check-circle text-emerald-500', error: 'fa-times-circle text-red-500', warning: 'fa-exclamation-circle text-amber-500', info: 'fa-info-circle text-blue-500' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info} text-lg"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---- STATUS HELPERS ----
function getStatusBadge(status) {
  const map = {
    'مهتم': 'badge-interested',
    'متردد': 'badge-hesitant',
    'غير مهتم': 'badge-not-interested',
    'اتصل لاحقًا': 'badge-call-later',
    'لم يرد': 'badge-no-answer',
    'تم التسجيل': 'badge-registered',
  };
  return `<span class="badge ${map[status] || 'badge-no-answer'}">${status}</span>`;
}

// ---- STATS ----
function calcStats() {
  const total = students.length;
  const contacted = students.filter(s => s.status !== 'لم يرد').length;
  const interested = students.filter(s => s.status === 'مهتم').length;
  const registered = students.filter(s => s.status === 'تم التسجيل').length;
  const noAnswer = students.filter(s => s.status === 'لم يرد').length;
  return { total, contacted, interested, registered, noAnswer };
}

// ---- DASHBOARD ----
function renderDashboard() {
  const s = calcStats();
  document.getElementById('stat-total').textContent = s.total;
  document.getElementById('stat-contacted').textContent = s.contacted;
  document.getElementById('stat-interested').textContent = s.interested;
  document.getElementById('stat-registered').textContent = s.registered;
  document.getElementById('stat-noanswer').textContent = s.noAnswer;
  document.getElementById('dash-total').textContent = s.total;
  document.getElementById('dash-registered').textContent = s.registered;

  // Today follow-ups (show students with followupDate today or no-answer/call-later)
  const today = new Date().toISOString().slice(0, 10);
  const todayStudents = students.filter(s =>
    s.status === 'لم يرد' || s.status === 'اتصل لاحقًا' || s.followupDate === today
  ).slice(0, 5);

  document.getElementById('today-count').textContent = todayStudents.length + ' طلاب';

  const tbody = document.getElementById('today-table');
  tbody.innerHTML = todayStudents.length ? todayStudents.map(s => `
    <tr>
      <td><div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">${s.name[0]}</div>
        <span class="font-medium">${s.name}</span>
      </div></td>
      <td><a href="tel:${s.phone}" class="text-blue-600 hover:underline font-mono text-sm">${s.phone}</a></td>
      <td><span class="text-slate-600 text-sm">${s.grade}</span></td>
      <td>${getStatusBadge(s.status)}</td>
      <td>
        <a href="tel:${s.phone}" class="btn-success text-xs py-1.5 px-3 inline-flex items-center gap-1">
          <i class="fas fa-phone text-xs"></i> اتصال
        </a>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="5" class="text-center py-8 text-slate-400"><i class="fas fa-check-circle text-2xl text-emerald-400 mb-2 block"></i>لا يوجد طلاب مجدولون اليوم</td></tr>`;
}

// ---- STUDENTS ----
function renderStudents(data) {
  const list = data || students;
  const tbody = document.getElementById('students-table');
  tbody.innerHTML = list.length ? list.map((s, i) => `
    <tr>
      <td class="text-slate-400 font-bold text-sm">${i + 1}</td>
      <td>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">${s.name[0]}</div>
          <div>
            <p class="font-semibold text-slate-800">${s.name}</p>
            <p class="text-xs text-slate-400">${s.school}</p>
          </div>
        </div>
      </td>
      <td><a href="tel:${s.phone}" class="text-blue-600 hover:underline font-mono text-sm">${s.phone}</a></td>
      <td class="text-sm text-slate-600 font-mono">${s.parentPhone || '—'}</td>
      <td><span class="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-semibold">${s.grade}</span></td>
      <td class="text-sm text-slate-600">${s.school}</td>
      <td class="text-sm text-slate-500 max-w-xs truncate">${s.notes || '—'}</td>
      <td>
        <div class="flex gap-2">
          <button onclick="editStudent(${s.id})" class="btn-edit text-xs"><i class="fas fa-edit ml-1"></i>تعديل</button>
          <button onclick="openDeleteModal(${s.id})" class="btn-danger text-xs"><i class="fas fa-trash ml-1"></i>حذف</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="8" class="text-center py-10 text-slate-400"><i class="fas fa-users text-3xl mb-2 block text-slate-300"></i>لا يوجد طلاب</td></tr>`;
}

function filterStudents(val) {
  const filtered = val ? students.filter(s =>
    s.name.includes(val) || s.phone.includes(val) || s.school.includes(val)
  ) : students;
  renderStudents(filtered);
}

function filterByClass(val) {
  const filtered = val ? students.filter(s => s.grade === val) : students;
  renderStudents(filtered);
}

// ---- ADD / EDIT STUDENT ----
function openAddStudentModal() {
  editingStudentId = null;
  document.getElementById('modal-student-title').textContent = 'إضافة طالب جديد';
  ['s-name','s-phone','s-parent-phone','s-class','s-school','s-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  openModal('modal-student');
}

function editStudent(id) {
  const s = students.find(x => x.id === id);
  if (!s) return;
  editingStudentId = id;
  document.getElementById('modal-student-title').textContent = 'تعديل بيانات الطالب';
  document.getElementById('s-name').value = s.name;
  document.getElementById('s-phone').value = s.phone;
  document.getElementById('s-parent-phone').value = s.parentPhone;
  document.getElementById('s-class').value = s.grade;
  document.getElementById('s-school').value = s.school;
  document.getElementById('s-notes').value = s.notes;
  openModal('modal-student');
}

function saveStudent() {
  const name = document.getElementById('s-name').value.trim();
  const phone = document.getElementById('s-phone').value.trim();
  const parentPhone = document.getElementById('s-parent-phone').value.trim();
  const grade = document.getElementById('s-class').value;
  const school = document.getElementById('s-school').value.trim();
  const notes = document.getElementById('s-notes').value.trim();

  if (!name) { showToast('الرجاء إدخال اسم الطالب', 'error'); return; }
  if (!phone) { showToast('الرجاء إدخال رقم الهاتف', 'error'); return; }

  // Duplicate phone check
  const duplicate = students.find(s => s.phone === phone && s.id !== editingStudentId);
  if (duplicate) {
    showToast(`هذا الرقم مسجل مسبقاً للطالب: ${duplicate.name}`, 'error');
    return;
  }

  if (editingStudentId) {
    const idx = students.findIndex(s => s.id === editingStudentId);
    if (idx > -1) {
      students[idx] = { ...students[idx], name, phone, parentPhone, grade, school, notes };
      showToast('تم تحديث بيانات الطالب بنجاح ✓', 'success');
    }
  } else {
    students.push({ id: nextStudentId++, name, phone, parentPhone, grade, school, notes, status: 'لم يرد', followupDate: '' });
    // Add to all campaigns
    Object.keys(campaignStudents).forEach(cid => {
      campaignStudents[cid].push({ studentId: nextStudentId - 1, status: 'لم يرد', notes: '' });
    });
    showToast('تم إضافة الطالب بنجاح ✓', 'success');
  }

  closeModal('modal-student');
  saveToStorage();
  renderStudents();
  updateStats();
}

// ---- DELETE ----
function openDeleteModal(id) {
  deletingStudentId = id;
  openModal('modal-delete');
}

function confirmDelete() {
  if (!deletingStudentId) return;
  students = students.filter(s => s.id !== deletingStudentId);
  Object.keys(campaignStudents).forEach(cid => {
    campaignStudents[cid] = campaignStudents[cid].filter(x => x.studentId !== deletingStudentId);
  });
  closeModal('modal-delete');
  saveToStorage();
  renderStudents();
  updateStats();
  if (currentCampaignId) renderCampaignStudents(currentCampaignId);
  showToast('تم حذف الطالب بنجاح', 'warning');
  deletingStudentId = null;
}

// ---- CAMPAIGNS ----
function renderCampaigns() {
  const container = document.getElementById('campaigns-list');
  document.getElementById('campaign-detail').classList.add('hidden');
  container.classList.remove('hidden');

  const colorPairs = [
    ['bg-blue-50', 'text-blue-700', 'bg-blue-100'],
    ['bg-purple-50', 'text-purple-700', 'bg-purple-100'],
    ['bg-emerald-50', 'text-emerald-700', 'bg-emerald-100'],
    ['bg-amber-50', 'text-amber-700', 'bg-amber-100'],
  ];

  container.innerHTML = campaigns.length ? campaigns.map((c, i) => {
    const colors = colorPairs[i % colorPairs.length];
    const total = campaignStudents[c.id] ? campaignStudents[c.id].length : 0;
    const registered = campaignStudents[c.id] ? campaignStudents[c.id].filter(x => x.status === 'تم التسجيل').length : 0;
    return `
      <div class="campaign-card cursor-pointer" onclick="openCampaignDetail(${c.id})">
        <div class="flex items-start justify-between mb-4">
          <div class="w-11 h-11 ${colors[2]} rounded-xl flex items-center justify-center">
            <i class="fas fa-bullhorn ${colors[1]}"></i>
          </div>
          <span class="text-xs text-slate-400">${c.date}</span>
        </div>
        <h3 class="font-bold text-slate-800 mb-1">${c.name}</h3>
        <p class="text-xs text-slate-500 mb-4 line-clamp-2">${c.notes || 'لا توجد ملاحظات'}</p>
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-500">${total} طالب</span>
          <span class="${colors[2]} ${colors[1]} px-2 py-1 rounded-lg font-bold">${registered} مسجل</span>
        </div>
        <div class="progress-bar mt-3">
          <div class="progress-fill bg-gradient-to-r from-blue-500 to-blue-400" style="width:${total ? Math.round(registered/total*100) : 0}%"></div>
        </div>
      </div>
    `;
  }).join('') : `<div class="col-span-3 text-center py-12 text-slate-400"><i class="fas fa-bullhorn text-4xl mb-3 block text-slate-300"></i>لا توجد حملات. أنشئ أول حملة الآن!</div>`;
}

function openCampaignDetail(id) {
  currentCampaignId = id;
  const campaign = campaigns.find(c => c.id === id);
  if (!campaign) return;

  document.getElementById('campaigns-list').classList.add('hidden');
  document.getElementById('campaign-detail').classList.remove('hidden');
  document.getElementById('campaign-detail-name').textContent = campaign.name;
  document.getElementById('campaign-detail-date').textContent = campaign.date;

  if (!campaignStudents[id]) {
    campaignStudents[id] = students.map(s => ({ studentId: s.id, status: 'لم يرد', notes: '' }));
  }

  renderCampaignStudents(id);
}

function renderCampaignStudents(cid) {
  const tbody = document.getElementById('campaign-students-table');
  const cs = campaignStudents[cid] || [];

  tbody.innerHTML = cs.length ? cs.map(entry => {
    const s = students.find(x => x.id === entry.studentId);
    if (!s) return '';
    return `
      <tr>
        <td>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">${s.name[0]}</div>
            <span class="font-medium text-sm">${s.name}</span>
          </div>
        </td>
        <td><a href="tel:${s.phone}" class="text-blue-600 text-sm font-mono hover:underline">${s.phone}</a></td>
        <td>
          <select class="status-select" onchange="updateCampaignStudentStatus(${cid}, ${s.id}, this.value)">
            ${['مهتم','متردد','غير مهتم','اتصل لاحقًا','لم يرد','تم التسجيل'].map(opt =>
              `<option ${entry.status === opt ? 'selected' : ''}>${opt}</option>`
            ).join('')}
          </select>
        </td>
        <td>
          <input type="text" class="form-input text-xs py-1.5" placeholder="ملاحظة..." value="${entry.notes}"
            onchange="updateCampaignStudentNotes(${cid}, ${s.id}, this.value)"
            style="width:180px"/>
        </td>
      </tr>
    `;
  }).join('') : `<tr><td colspan="4" class="text-center py-8 text-slate-400">لا يوجد طلاب في هذه الحملة</td></tr>`;
}

function hideCampaignDetail() {
  document.getElementById('campaign-detail').classList.add('hidden');
  document.getElementById('campaigns-list').classList.remove('hidden');
}

function updateCampaignStudentStatus(cid, sid, val) {
  if (!campaignStudents[cid]) return;
  const entry = campaignStudents[cid].find(x => x.studentId === sid);
  if (entry) {
    entry.status = val;
    // Update global student status too
    const s = students.find(x => x.id === sid);
    if (s) s.status = val;
    showToast('تم تحديث الحالة بنجاح', 'success');
    saveToStorage();
    updateStats();
  }
}

function updateCampaignStudentNotes(cid, sid, val) {
  if (!campaignStudents[cid]) return;
  const entry = campaignStudents[cid].find(x => x.studentId === sid);
  if (entry) {
    entry.notes = val;
    saveToStorage();
  }
}

// ---- ADD CAMPAIGN ----
function openAddCampaignModal() {
  document.getElementById('c-name').value = '';
  document.getElementById('c-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('c-notes').value = '';
  openModal('modal-campaign');
}

function saveCampaign() {
  const name = document.getElementById('c-name').value.trim();
  const date = document.getElementById('c-date').value;
  const notes = document.getElementById('c-notes').value.trim();

  if (!name) { showToast('الرجاء إدخال اسم الحملة', 'error'); return; }

  const newCampaign = { id: nextCampaignId++, name, date, notes };
  campaigns.push(newCampaign);
  campaignStudents[newCampaign.id] = students.map(s => ({ studentId: s.id, status: 'لم يرد', notes: '' }));

  closeModal('modal-campaign');
  saveToStorage();
  renderCampaigns();
  showToast('تم إنشاء الحملة بنجاح ✓', 'success');
}

// ---- FOLLOW-UPS ----
function renderFollowups() {
  const followupStudents = students.filter(s =>
    ['لم يرد', 'اتصل لاحقًا', 'متردد', 'مهتم'].includes(s.status)
  );

  const tbody = document.getElementById('followups-table');
  const today = new Date().toISOString().slice(0, 10);

  tbody.innerHTML = followupStudents.length ? followupStudents.map(s => {
    const isToday = s.followupDate === today;
    return `
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
        <td>${getStatusBadge(s.status)}</td>
        <td class="text-sm text-slate-600 font-mono">${s.followupDate || '—'}</td>
        <td class="text-sm text-slate-500 max-w-xs">${s.notes || '—'}</td>
        <td>
          <a href="tel:${s.phone}" class="btn-primary py-1.5 px-4 text-xs inline-flex items-center gap-2">
            <i class="fas fa-phone text-xs"></i> اتصال
          </a>
        </td>
      </tr>
    `;
  }).join('') : `<tr><td colspan="6" class="text-center py-10 text-slate-400"><i class="fas fa-check-circle text-3xl mb-2 block text-emerald-400"></i>رائع! لا يوجد طلاب يحتاجون متابعة حالياً</td></tr>`;
}

// ---- REPORTS ----
function renderReports() {
  const s = calcStats();
  document.getElementById('rep-calls').textContent = s.contacted;
  document.getElementById('rep-reg').textContent = s.registered;
  document.getElementById('rep-campaigns').textContent = campaigns.length;
  document.getElementById('rep-interested').textContent = s.interested;

  // Status breakdown
  const statusGroups = {};
  students.forEach(x => { statusGroups[x.status] = (statusGroups[x.status] || 0) + 1; });
  const colorMap = {
    'مهتم': 'from-emerald-500 to-emerald-400',
    'متردد': 'from-amber-500 to-amber-400',
    'غير مهتم': 'from-red-500 to-red-400',
    'اتصل لاحقًا': 'from-purple-500 to-purple-400',
    'لم يرد': 'from-slate-400 to-slate-300',
    'تم التسجيل': 'from-blue-600 to-blue-400',
  };

  const container = document.getElementById('status-breakdown');
  container.innerHTML = Object.entries(statusGroups).map(([status, count]) => {
    const pct = Math.round(count / students.length * 100);
    return `
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            ${getStatusBadge(status)}
          </div>
          <span class="text-sm font-bold text-slate-700">${count} (${pct}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill bg-gradient-to-r ${colorMap[status] || 'from-blue-500 to-blue-400'}" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ---- MODAL HELPERS ----
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Click outside modal to close
document.addEventListener('click', function(e) {
  ['modal-student', 'modal-campaign', 'modal-delete'].forEach(id => {
    const overlay = document.getElementById(id);
    if (overlay && e.target === overlay) closeModal(id);
  });
});

// Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    ['modal-student', 'modal-campaign', 'modal-delete'].forEach(id => closeModal(id));
  }
});

// ---- UPDATE STATS ----
function updateStats() {
  const s = calcStats();
  document.getElementById('stat-total') && (document.getElementById('stat-total').textContent = s.total);
  document.getElementById('stat-contacted') && (document.getElementById('stat-contacted').textContent = s.contacted);
  document.getElementById('stat-interested') && (document.getElementById('stat-interested').textContent = s.interested);
  document.getElementById('stat-registered') && (document.getElementById('stat-registered').textContent = s.registered);
  document.getElementById('stat-noanswer') && (document.getElementById('stat-noanswer').textContent = s.noAnswer);
  document.getElementById('dash-total') && (document.getElementById('dash-total').textContent = s.total);
  document.getElementById('dash-registered') && (document.getElementById('dash-registered').textContent = s.registered);
}

// ---- DATE ----
function setDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = now.toLocaleDateString('ar-SA', opts);
}

// ---- INIT ----
function init() {
  const hasData = loadFromStorage();
  
  if (!hasData) {
    // Initial data if nothing in storage
    nextStudentId = 13;
    nextCampaignId = 3;
    initCampaignStudents();
  }
  
  setDate();
  renderDashboard();

  // Animate progress bars in reports after a delay
  setTimeout(() => {
    document.querySelectorAll('.progress-fill').forEach(el => {
      const w = el.style.width;
      el.style.width = '0%';
      setTimeout(() => { el.style.width = w; }, 100);
    });
  }, 300);
}

document.addEventListener('DOMContentLoaded', init);
