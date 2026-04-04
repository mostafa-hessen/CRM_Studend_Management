/**
 * Backup Service - Export Utility
 */
export const BackupService = {
  async exportJSON(data, fileName = `backup_${new Date().toISOString().split('T')[0]}.json`) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this._download(blob, fileName);
  },

  async exportCSV(state) {
    if (!state.students.length) return;
    
    let csvContent = "\uFEFF"; // BOM for Arabic
    csvContent += "--- بيانات الطلاب ---\nالاسم,الهاتف,الصف,الحالة\n";
    state.students.forEach(s => {
      csvContent += `"${s.name}","${s.phone}","${s.grade}","${s.status}"\n`;
    });
    
    const fileName = `students_report_${new Date().toISOString().split('T')[0]}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this._download(blob, fileName);
  },

  _download(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
};
