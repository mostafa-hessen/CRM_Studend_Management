import { describe, it, expect, beforeEach } from 'vitest';
import { Auth } from '../assets/js/modules/auth.js';

describe('Auth Module', () => {
    it('should correctly identify admin user', () => {
        const adminUser = { username: 'wael', name: 'الشيخ وائل', role: 'مدير النظام' };
        expect(Auth.isAdmin(adminUser)).toBe(true);
    });

    it('should correctly identify a standard employee', () => {
        const employeeUser = { username: 'sara', name: 'سارة', role: 'موظفة' };
        expect(Auth.isAdmin(employeeUser)).toBe(false);
    });

    it('should load initial users correctly', () => {
        const users = Auth.getInitialUsers();
        expect(users).toHaveProperty('wael');
        expect(users['wael'].role).toBe('مدير النظام');
        expect(users).toHaveProperty('sara');
    });

    it('should logout correctly (placeholder for location reload test)', () => {
        // Since logout calls location.reload, we'd normally mock it
        // For now, it's just to see if the function exists
        expect(typeof Auth.logout).toBe('function');
    });
});
