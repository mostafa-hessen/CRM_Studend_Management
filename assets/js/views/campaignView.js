import { UIService } from '../services/uiService.js';

export const CampaignView = {
  renderList(campaigns, classes = []) {
    const container = document.getElementById('campaigns-list');
    if (!container) return;

    // Ensure list is visible and details are hidden
    container.classList.remove('hidden');
    container.style.display = ''; // Clear inline styles to restore grid
    const detail = document.getElementById('campaign-detail');
    if(detail) {
      detail.classList.add('hidden');
      detail.style.display = 'none';
    }

    if (!campaigns.length) {
      container.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
        <i class="fas fa-bullhorn text-4xl mb-4 text-slate-300"></i>
        <p>لا يوجد حملات حالياً. ابدأ بإنشاء حملة جديدة.</p>
      </div>`;
      return;
    }

    container.innerHTML = campaigns.map(c => {
      // Calculation based on Success statuses
      const total = c.totalStudents || 0;
      const success = c.successStudents || 0;
      const progress = total ? Math.round((success / total) * 100) : 0;
      const targetGradeName = c.target_grade_id ? (classes.find(cls => cls.id === c.target_grade_id)?.name || c.target_grade_id) : 'الكل';
      
      return `
        <div class="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden" 
             onclick="viewCampaign(${c.id})" 
             data-grade-id="${c.target_grade_id || ''}" 
             data-education="${c.education_type || 'الكل'}">
          <div class="absolute top-0 right-0 w-1 h-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'} opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="flex justify-between items-start mb-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <i class="fas fa-bullhorn text-xl"></i>
              </div>
              <div>
                <h3 class="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors">${c.name}</h3>
                <p class="text-xs text-slate-400 mt-1"><i class="far fa-calendar-alt ml-1"></i>${new Date(c.created_at).toLocaleDateString('ar-SA')}</p>
              </div>
            </div>
            <div class="flex gap-1 relative z-10" onclick="event.stopPropagation()">
               <button onclick="editCampaign(${c.id})" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="تعديل">
                 <i class="fas fa-edit"></i>
               </button>
            </div>
          </div>
          
          <div class="bg-slate-50 rounded-xl p-3 mb-5 flex divide-x divide-x-reverse divide-slate-200">
            <div class="flex-1 px-2 text-center">
               <p class="text-[10px] text-slate-400 mb-1">الصف المستهدف</p>
               <p class="text-xs font-bold text-slate-700 truncate" title="${targetGradeName}">${targetGradeName}</p>
            </div>
            <div class="flex-1 px-2 text-center">
               <p class="text-[10px] text-slate-400 mb-1">نوع التعليم</p>
               <p class="text-xs font-bold text-slate-700">${c.education_type || 'الكل'}</p>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100">
            <div class="flex justify-between text-[10px] mb-2">
              <span class="text-slate-600 font-bold">نسبة النجاح بالحملة</span>
              <span class="font-black ${progress === 100 ? 'text-emerald-500' : 'text-blue-600'}">${progress}%</span>
            </div>

            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div class="${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'} h-full transition-all duration-1000 relative" style="width: ${progress}%">
                <div class="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full h-full" style="background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent); background-size: 1rem 1rem;"></div>
              </div>
            </div>
            <div class="flex justify-between mt-3 text-xs">
               <span class="text-slate-500 flex items-center gap-1"><i class="fas fa-users text-slate-400"></i> ${c.totalStudents || 0} طالب</span>
               <span class="text-slate-500 flex items-center gap-1"><i class="fas fa-check-circle text-emerald-500"></i> تم التواصل: <span class="font-bold text-slate-800">${c.contactedStudents || 0}</span></span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderView(id, campaign, studentsInCampaign, allStudents, classes = []) {
    const listContainer = document.getElementById('campaigns-list');
    if(listContainer) {
      listContainer.classList.add('hidden');
      listContainer.style.display = 'none';
    }
    const detail = document.getElementById('campaign-detail');
    detail.classList.remove('hidden');
    detail.style.display = 'block';

    const html = `
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div class="flex items-center gap-4">
          <button onclick="hideCampaignDetail()" class="w-10 h-10 shrink-0 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all">
            <i class="fas fa-arrow-right"></i>
          </button>
          <div>
            <h2 class="text-2xl font-black text-slate-800">${campaign.name}</h2>
            <p class="text-slate-500 text-sm">تفاصيل التواصل والمتابعة الخاصة بالطلاب المستهدفين</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button onclick="openAddStudentCampaignModal(${id})" class="btn-primary text-sm">
            <i class="fas fa-user-plus mr-2"></i> إضافة طالب جديد للحملة
          </button>
          <button onclick="syncMissingStudents(${id})" class="btn-primary-outline text-sm">
            <i class="fas fa-sync-alt mr-2"></i> تحديث القائمة
          </button>
        </div>
      </div>

      <!-- Target Audience Section -->
      <div class="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 flex flex-wrap gap-6 items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><i class="fas fa-bullseye"></i></div>
          <div>
            <p class="text-xs text-slate-500">المستهدفون بالحملة</p>
            <p class="font-bold text-blue-900">
              الصف: ${campaign.target_grade_id ? (classes.find(c => c.id === campaign.target_grade_id)?.name || campaign.target_grade_id) : 'الجميع'} 
              <span class="mx-2 text-blue-300">|</span> 
              النوع: ${campaign.education_type || 'الكل'}
            </p>
          </div>
        </div>
        <div class="h-8 w-px bg-blue-200 hidden md:block"></div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><i class="fas fa-users"></i></div>
          <div>
            <p class="text-xs text-slate-500">العدد الحالي</p>
            <p class="font-bold text-emerald-900">${studentsInCampaign.length} طالب مسجل</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 mb-5 flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-48">
          <input type="text" id="search-campaign-student-query" placeholder="بحث بالاسم أو رقم الهاتف..." class="form-input pr-10" oninput="window.filterCampaignStudents()"/>
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        </div>
        <select id="filter-campaign-student-status" class="form-input w-auto" onchange="window.filterCampaignStudents()">
          <option value="">جميع الحالات</option>
          ${(campaign.statuses ? JSON.parse(campaign.statuses) : ['إيجابي', 'متردد', 'اون لاين', 'موعد غير مناسب', 'اون لاين موعد', 'خارج الحملة', 'حملة زميل', 'لم يرد']).map(st => 
            `<option value="${st}">${st}</option>`
          ).join('')}
        </select>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table class="w-full text-right table-auto border-collapse">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="p-4 font-bold text-slate-600">الطالب</th>
              <th class="p-4 font-bold text-slate-600">رقم الهاتف</th>
              <th class="p-4 font-bold text-slate-600">حالة التواصل</th>
              <th class="p-4 font-bold text-slate-600">موعد المتابعة</th>
              <th class="p-4 font-bold text-slate-600">ملاحظات</th>
              <th class="p-4 font-bold text-slate-600 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${studentsInCampaign.map(entry => {
              const s = allStudents.find(x => x.id === entry.student_id);

              if (!s) return '';
              const sGradeName = s.grade_id ? (classes.find(c => c.id === s.grade_id)?.name || s.grade_id) : '';
              return `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="p-4">
                    <p class="font-bold text-slate-800">${s.name || 'مجهول'}</p>
                    <p class="text-xs text-slate-400 mt-1">${sGradeName} - ${s.education_type || ''}</p>
                  </td>
                  <td class="p-4">
                    <a href="tel:${s.phone}" class="text-blue-600 font-mono text-sm hover:underline" dir="ltr">${s.phone}</a>
                  </td>
                      ${(campaign.statuses ? JSON.parse(campaign.statuses) : [
                        { name: 'لم يتم التحديد بعد', type: 'followup' },
                        { name: 'إيجابي', type: 'success' },
                        { name: 'متردد', type: 'followup' },
                        { name: 'اون لاين', type: 'success' },
                        { name: 'موعد غير مناسب', type: 'outside' },
                        { name: 'اون لاين موعد', type: 'success' },
                        { name: 'خارج الحملة', type: 'outside' },
                        { name: 'حملة زميل', type: 'outside' },
                        { name: 'لم يرد', type: 'followup' }
                      ]).map(tag => {
                        const name = tag.name || tag;
                        const type = tag.type || 'followup';
                        const prefix = name === 'لم يتم التحديد بعد' ? '🔘 ' : (type === 'success' ? '✅ ' : (type === 'outside' ? '❌ ' : '⏳ '));
                        return `<option value="${name}" ${entry.status === name ? 'selected' : ''}>${prefix}${name}</option>`;
                      }).join('')}
                    </select>
                  </td>


                  <td class="p-4">
                    <input type="date" value="${entry.followupDate || ''}" onchange="updateCampaignStudentFollowupDate(${id}, ${s.id}, this.value)" class="form-input text-xs py-2 px-3 w-full max-w-[130px]">
                  </td>
                  <td class="p-4">
                    <input type="text" value="${entry.notes || ''}" placeholder="أضف ملاحظة..." onblur="updateCampaignStudentNotes(${id}, ${s.id}, this.value)" class="form-input text-xs py-2 px-3 w-full">
                  </td>
                  <td class="p-4 text-center">
                    <a href="https://wa.me/${(s.phone || '').startsWith('0') ? '2'+s.phone : s.phone}" target="_blank" class="inline-flex w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="مراسلة عبر واتساب">
                      <i class="fab fa-whatsapp"></i>
                    </a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${!studentsInCampaign.length ? `<div class="p-20 text-center text-slate-500 flex flex-col items-center">
            <i class="fas fa-users-slash text-4xl mb-4 text-slate-300"></i>
            <p>لا يوجد طلاب في هذه الحملة حالياً. جرب تحديث قائمة الطلاب لإضافة المستهدفين.</p>
        </div>` : ''}
      </div>
    `;
    detail.innerHTML = html;
  },

  showCampaignModal(title, campaign = null, classes = []) {
    document.getElementById('modal-campaign-title').textContent = title;
    
    // Populate classes dropdown for campaign target grade
    const classSelect = document.getElementById('c-target-grade');
    if (classSelect) {
      classSelect.innerHTML = '<option value="">الكل</option>' + 
        classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    if (campaign) {
      document.getElementById('save-campaign-btn-text').textContent = 'حفظ التعديلات';
      document.getElementById('c-name').value = campaign.name || '';
      document.getElementById('c-target-grade').value = campaign.target_grade_id || '';
      document.getElementById('c-education-type').value = campaign.education_type || 'الكل';

      this.renderStatusTags(campaign.statuses ? JSON.parse(campaign.statuses) : []);
    } else {
      document.getElementById('save-campaign-btn-text').textContent = 'إنشاء الحملة';
      document.getElementById('c-name').value = '';
      document.getElementById('c-target-grade').value = '';
      document.getElementById('c-education-type').value = 'الكل';
      document.getElementById('c-status-type').value = 'success';

      const defaultStatuses = [
        { name: 'لم يتم التحديد بعد', type: 'followup' },
        { name: 'إيجابي', type: 'success' },
        { name: 'متردد', type: 'followup' },
        { name: 'اون لاين', type: 'success' },
        { name: 'موعد غير مناسب', type: 'outside' },
        { name: 'اون لاين موعد', type: 'success' },
        { name: 'خارج الحملة', type: 'outside' },
        { name: 'حملة زميل', type: 'outside' },
        { name: 'لم يرد', type: 'followup' }
      ];
      this.renderStatusTags(defaultStatuses);
    }
    UIService.openModal('modal-campaign');
  },

  renderStatusTags(tags) {
    const container = document.getElementById('c-status-tags');
    const typeIcons = { success: 'fa-check-circle text-emerald-500', followup: 'fa-clock text-blue-500', outside: 'fa-times-circle text-red-500' };
    
    container.innerHTML = tags.map(t => {
      const name = t.name || t;
      const type = t.type || 'followup';
      return `
        <span class="badge ${type === 'success' ? 'badge-interested' : (type === 'outside' ? 'badge-not-interested' : 'badge-call-later')} flex items-center gap-2">
          <i class="fas ${typeIcons[type] || 'fa-tag'}"></i>
          ${name}
          <i class="fas fa-times cursor-pointer hover:text-red-500" onclick="removeCampaignStatusTag('${name}')"></i>
        </span>
      `;
    }).join('');
    this._currentTags = tags;
  },

  getFormData() {
    return {
      name: document.getElementById('c-name').value.trim(),
      target_grade_id: document.getElementById('c-target-grade').value === 'الكل' ? null : (document.getElementById('c-target-grade').value || null),
      education_type: document.getElementById('c-education-type').value,

      statuses: JSON.stringify(this._currentTags || [])
    };
  },

  getStatuses() {
    return this._currentTags || [];
  },
  _currentTags: []
};
