import { describe, it, expect, vi } from 'vitest';
import { Classes } from '../assets/js/modules/classes.js';

describe('Classes Module', () => {
    it('should add a new class if id is not provided', () => {
        const state = { classes: [], students: [] };
        const callbacks = { addLog: vi.fn() };
        const result = Classes.handleSave(state, null, 'أولى ثانوي', callbacks);
        
        expect(result).toBe(true);
        expect(state.classes).toHaveLength(1);
        expect(state.classes[0].name).toBe('أولى ثانوي');
        expect(callbacks.addLog).toHaveBeenCalledWith('إضافة صف', 'أولى ثانوي');
    });

    it('should update an existing class if id is provided', () => {
        const state = { 
            classes: [{ id: 1, name: 'قديم' }], 
            students: [{ name: 'طالب', grade: 'قديم' }] 
        };
        const callbacks = { addLog: vi.fn() };
        
        const result = Classes.handleSave(state, 1, 'جديد', callbacks);
        
        expect(result).toBe(true);
        expect(state.classes[0].name).toBe('جديد');
        expect(state.students[0].grade).toBe('جديد');
        expect(callbacks.addLog).toHaveBeenCalledWith('تعديل صف', 'جديد');
    });

    it('should fail if name is empty', () => {
        const state = { classes: [], students: [] };
        const callbacks = { addLog: vi.fn() };
        // We'd normally mock UI.showToast if needed, but since it's an import,
        // it may need special handling in Vitest.
        const result = Classes.handleSave(state, null, '', callbacks);
        expect(result).toBe(false);
    });

    it('should render options correctly', () => {
        const classes = [{ name: 'A' }, { name: 'B' }];
        const html = Classes.renderOptions(classes, true);
        expect(html).toContain('<option value="الكل">جميع الصفوف</option>');
        expect(html).toContain('<option value="A">A</option>');
    });
});
