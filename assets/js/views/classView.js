import { UIService } from '../services/uiService.js';

export const ClassView = {
  renderList(classes) {
    const list = document.getElementById('classes-list');
    if (!list) return;

    if (!classes.length) {
      list.innerHTML = `<div class="md:col-span-4 text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">لا يوجد صفوف دراسية حالياً</div>`;
      return;
    }

    list.innerHTML = classes.map(c => `
      <div class="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
        
        <div class="flex justify-between items-start relative z-10">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/30">
              <i class="fas fa-chalkboard"></i>
            </div>
            <div>
              <h3 class="font-black text-slate-800 tracking-tight text-xl mb-1">${c.name}</h3>
              <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-xs font-mono font-bold">
                <i class="fas fa-hashtag text-[10px] opacity-50"></i>${c.id}
              </span>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button onclick="editClass(${c.id})" class="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/20 transition-all flex items-center justify-center" title="تعديل">
              <i class="fas fa-pen text-sm"></i>
            </button>
            <button onclick="deleteClass(${c.id})" class="w-10 h-10 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20 transition-all flex items-center justify-center" title="حذف">
              <i class="fas fa-trash-alt text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  showModal(title, classData = null) {
    document.getElementById('modal-class-title').textContent = title;
    document.getElementById('save-class-btn-text').textContent = classData ? 'حفظ التعديلات' : 'حفظ الصف';
    document.getElementById('cl-name').value = classData ? classData.name : '';
    UIService.openModal('modal-class');
  }
};
