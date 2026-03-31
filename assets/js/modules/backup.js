// Backup Module
export const Backup = {
  async exportToJSON(data, directoryHandle = null, isAuto = false) {
    if (!data) return;

    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('ar-SA').replace(/:/g, '-');
    const fileName = isAuto ? `auto_backup_${date}_${time}.json` : `backup_students_${date}.json`;
    const jsonString = JSON.stringify(data, null, 2);

    if (directoryHandle) {
      try {
        if (await directoryHandle.queryPermission({mode: 'readwrite'}) !== 'granted') {
          if (!isAuto) await directoryHandle.requestPermission({mode: 'readwrite'});
          else return;
        }
        const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        return true;
      } catch (err) {
        console.error(err);
      }
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  },

  async exportToExcel(state, directoryHandle = null, isAuto = false) {
    if (!state.students.length) return;
    
    let csvContent = "\uFEFF"; // BOM for Arabic
    
    // Section 1: Students Data
    csvContent += "--- بيانات الطلاب ---\n";
    csvContent += "الاسم,الهاتف,هاتف ولي الأمر,الصف,نوع التعليم,المدرسة,الحالة العامة,المتابعة التالية,ملاحظات\n";
    state.students.forEach(s => {
      csvContent += `"${s.name}","${s.phone}","${s.parentPhone || ''}","${s.grade}","${s.educationType || 'عام'}","${s.school || ''}","${s.status}","${s.followupDate || ''}","${(s.notes || '').replace(/\n/g, ' ')}"\n`;
    });
    
    csvContent += "\n--- الصفوف الدراسية ---\n";
    csvContent += "اسم الصف,عدد الطلاب\n";
    state.classes.forEach(c => {
      const count = state.students.filter(s => s.grade === c.name).length;
      csvContent += `"${c.name}","${count}"\n`;
    });

    csvContent += "\n--- تفاصيل الحملات والمتابعات ---\n";
    csvContent += "الحملة,اسم الطالب,رقم الهاتف,الحالة في الحملة,تاريخ المتابعة,ملاحظات الحملة\n";
    state.campaigns.forEach(c => {
      const cs = state.campaignStudents[c.id] || [];
      cs.forEach(entry => {
        const s = state.students.find(x => x.id === entry.studentId);
        if (s) {
          csvContent += `"${c.name}","${s.name}","${s.phone}","${entry.status}","${entry.followupDate || ''}","${(entry.notes || '').replace(/\n/g, ' ')}"\n`;
        }
      });
    });

    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('ar-SA').replace(/:/g, '-');
    const fileName = isAuto ? `auto_backup_${date}_${time}.csv` : `students_full_report_${date}.csv`;

    if (directoryHandle) {
      try {
        if (await directoryHandle.queryPermission({mode: 'readwrite'}) !== 'granted') {
          if (!isAuto) await directoryHandle.requestPermission({mode: 'readwrite'});
          else return;
        }
        const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(csvContent);
        await writable.close();
        return true;
      } catch (err) {
        console.error(err);
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
};
