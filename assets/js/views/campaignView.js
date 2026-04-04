import { UIService } from '../services/uiService.js';

export const CampaignView = {
  renderList(campaigns) {
    const container = document.getElementById('campaigns-list');
    if (!container) return;

    if (!campaigns.length) {
      container.innerHTML = `<div class="col-span-full text-center py-20 text-slate-400">لا يوجد حملات حالياً. ابدأ بإنشاء حملة جديدة.</div>`;
      return;
    }

    container.innerHTML = campaigns.map(c => {
      const progress = c.totalStudents ? Math.round((c.contactedStudents / c.totalStudents) * 100) : 0;
      return `
        <div class="card p-5 group hover:border-blue-200 transition-all cursor-pointer" onclick="viewCampaign(${c.id})">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">${c.name}</h3>
              <p class="text-xs text-slate-400 mt-1"><i class="far fa-calendar-alt ml-1"></i>${new Date(c.created_at).toLocaleDateString('ar-SA')}</p>
            </div>
            <div class="flex gap-1" onclick="event.stopPropagation()">
               <button onclick="editCampaign(${c.id})" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="تعديل">
                 <i class="fas fa-edit"></i>
               </button>
            </div>
          </div>
          
          <div class="space-y-3 mb-4">
            <div class="flex items-center gap-2 text-sm text-slate-500">
               <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-blue-600"><i class="fas fa-graduation-cap"></i></span>
               <span>الصف: <span class="font-semibold text-slate-700">${c.targetGrade}</span></span>
            </div>
            <div class="flex items-center gap-2 text-sm text-slate-500">
               <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600"><i class="fas fa-school"></i></span>
               <span>النوع: <span class="font-semibold text-slate-700">${c.educationType}</span></span>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100">
            <div class="flex justify-between text-xs mb-2">
              <span class="text-slate-500">نسبة الإنجاز</span>
              <span class="font-bold text-blue-600">${progress}%</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div class="bg-blue-500 h-full transition-all duration-1000" style="width: ${progress}%"></div>
            </div>
            <div class="flex justify-between mt-3 text-xs">
               <span class="text-slate-400">الطلاب: <span class="text-slate-700 font-bold">${c.totalStudents || 0}</span></span>
               <span class="text-slate-400">تم التواصل: <span class="text-emerald-600 font-bold">${c.contactedStudents || 0}</span></span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderView(id, campaign, studentsInCampaign, allStudents) {
    document.getElementById('campaigns-list').classList.add('hidden');
    const detail = document.getElementById('campaign-detail');
    detail.classList.remove('hidden');

    const html = `
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <button onclick="hideCampaignDetail()" class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all">
            <i class="fas fa-arrow-right"></i>
          </button>
          <div>
            <h2 class="text-2xl font-black text-slate-800">${campaign.name}</h2>
            <p class="text-slate-500 text-sm">تفاصيل التواصل والمتابعة للحملة</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button onclick="syncMissingStudents(${id})" class="btn-primary-outline text-sm">
            <i class="fas fa-sync-alt ml-2"></i>تحديث قائمة الطلاب
          </button>
        </div>
      </div>

      <div class="card overflow-hidden">
        <table class="w-full">
          <thead>
            <tr>
              <th>الطالب</th>
              <th>رقم الهاتف</th>
              <th>حالة التواصل</th>
              <th>موعد المتابعة</th>
              <th>ملاحظات</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            ${studentsInCampaign.map(entry => {
              const s = allStudents.find(x => x.id === entry.studentId);
              if (!s) return '';
              return `
                <tr>
                  <td>
                    <p class="font-bold text-slate-800">${s.name}</p>
                    <p class="text-xs text-slate-400">${s.grade} - ${s.educationType}</p>
                  </td>
                  <td><a href="tel:${s.phone}" class="text-blue-600 font-mono">${s.phone}</a></td>
                  <td>
                    <select onchange="updateCampaignStudentStatus(${id}, ${s.id}, this.value)" class="input-field text-xs p-1">
                      ${(campaign.possibleStatuses || ['لم يتم الاتصال', 'لم يرد', 'اتصل لاحقاً', 'متردد', 'مهتم', 'تم التسجيل', 'غير مهتم']).map(st => 
                        `<option value="${st}" ${entry.status === st ? 'selected' : ''}>${st}</option>`
                      ).join('')}
                    </select>
                  </td>
                  <td>
                    <input type="date" value="${entry.followupDate || ''}" onchange="updateCampaignStudentFollowupDate(${id}, ${s.id}, this.value)" class="input-field text-xs p-1">
                  </td>
                  <td>
                    <input type="text" value="${entry.notes || ''}" placeholder="أضف ملاحظة..." onblur="updateCampaignStudentNotes(${id}, ${s.id}, this.value)" class="input-field text-xs p-1">
                  </td>
                  <td>
                    <a href="https://wa.me/${s.phone.startsWith('0') ? '2'+s.phone : s.phone}" target="_blank" class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                      <i class="fab fa-whatsapp"></i>
                    </a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${!studentsInCampaign.length ? `<div class="p-20 text-center text-slate-400">لا يوجد طلاب في هذه الحملة حالياً.</div>` : ''}
      </div>
    `;
    detail.innerHTML = html;
  },

  showCampaignModal(title, campaign = null) {
    document.getElementById('modal-campaign-title').textContent = title;
    if (campaign) {
      document.getElementById('c-name').value = campaign.name || '';
      document.getElementById('c-grade').value = campaign.targetGrade || 'الكل';
      document.getElementById('c-type').value = campaign.educationType || 'الكل';
      this.renderStatusTags(campaign.possibleStatuses || []);
    } else {
      document.getElementById('c-name').value = '';
      document.getElementById('c-grade').value = 'الكل';
      document.getElementById('c-type').value = 'الكل';
      this.renderStatusTags(['لم يتم الاتصال', 'لم يرد', 'اتصل لاحقاً', 'متردد', 'مهتم', 'تم التسجيل', 'غير مهتم']);
    }
    UIService.openModal('modal-campaign');
  },

  renderStatusTags(tags) {
    const container = document.getElementById('c-status-tags');
    container.innerHTML = tags.map(t => `
      <span class="badge badge-interested flex items-center gap-2">
        ${t}
        <i class="fas fa-times cursor-pointer hover:text-red-500" onclick="removeCampaignStatusTag('${t}')"></i>
      </span>
    `).join('');
    this._currentTags = tags;
  },

  getFormData() {
    return {
      name: document.getElementById('c-name').value.trim(),
      targetGrade: document.getElementById('c-grade').value,
      educationType: document.getElementById('c-type').value,
      possibleStatuses: this._currentTags || []
    };
  },

  getStatuses() {
    return this._currentTags || [];
  },
  _currentTags: []
};
