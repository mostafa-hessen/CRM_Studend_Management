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
      <div class="card p-5 flex items-center justify-between hover:shadow-md transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
            ${c.name ? c.name[0] : 'C'}
          </div>
          <div>
            <p class="font-bold text-slate-800">${c.name}</p>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: ${c.id}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="editClass(${c.id})" class="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all">
            <i class="fas fa-edit text-sm"></i>
          </button>
          <button onclick="deleteClass(${c.id})" class="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
            <i class="fas fa-trash-alt text-sm"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  showModal(title, classData = null) {
    document.getElementById('modal-class-title').textContent = title;
    document.getElementById('class-name').value = classData ? classData.name : '';
    UIService.openModal('modal-class');
  }
};
