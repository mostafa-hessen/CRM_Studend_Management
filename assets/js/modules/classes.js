// Classes Module
import { UI } from './ui.js';

export const Classes = {
  render(classesList, studentsList, containerId) {
    const list = document.getElementById(containerId);
    if (!list) return;

    list.innerHTML = classesList.length ? classesList.map(c => {
      const studentCount = studentsList.filter(s => s.grade === c.name).length;
      return `
        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
              ${c.name ? c.name[0] : 'C'}
            </div>
            <div>
              <p class="font-bold text-slate-800">${c.name}</p>
              <div class="flex items-center gap-2">
                 <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                 <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${studentCount} طالب مسجل</p>
              </div>
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
      `;
    }).join('') : `<div class="md:col-span-4 text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold"><i class="fas fa-school text-3xl mb-3 block text-slate-300"></i>لا توجد صفوف دراسية منشأة حالياً</div>`;
  }
};
