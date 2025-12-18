// === Tests para useUsuarioValidation ===
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUsuarioValidation } from '../useUsuarioValidation';
import * as toastModule from '../../utils/feedback/toasts';

// Mock del módulo de toasts
vi.mock('../../utils/feedback/toasts', () => ({
  showToast: vi.fn(),
}));

describe('useUsuarioValidation', () => {
  describe('validateEmailUnique', () => {
    it('debe retornar true cuando el email es único', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      const usuarios = [
        { id: '1', email: 'user1@test.com' },
        { id: '2', email: 'user2@test.com' },
      ];

      expect(result.current.validateEmailUnique('newuser@test.com', usuarios)).toBe(true);
    });

    it('debe retornar false cuando el email ya existe', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      const usuarios = [
        { id: '1', email: 'user1@test.com' },
        { id: '2', email: 'user2@test.com' },
      ];

      expect(result.current.validateEmailUnique('user1@test.com', usuarios)).toBe(false);
    });

    it('debe ignorar el email del usuario actual en edición', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      const usuarios = [
        { id: '1', email: 'user1@test.com' },
        { id: '2', email: 'user2@test.com' },
      ];

      expect(result.current.validateEmailUnique('user1@test.com', usuarios, '1')).toBe(true);
    });

    it('debe ser case-insensitive', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      const usuarios = [
        { id: '1', email: 'USER1@TEST.COM' },
      ];

      expect(result.current.validateEmailUnique('user1@test.com', usuarios)).toBe(false);
    });
  });

  describe('validateCustomPassword', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('debe retornar null cuando no se proporciona password', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      
      expect(result.current.validateCustomPassword('', '')).toBe(null);
    });

    it('debe retornar false y mostrar error cuando falta confirmación', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      
      const res = result.current.validateCustomPassword('password123', '');
      
      expect(res).toBe(false);
      expect(toastModule.showToast).toHaveBeenCalledWith(
        expect.stringContaining('Completa y confirma'),
        'error'
      );
    });

    it('debe retornar false cuando password es muy corta', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      
      const res = result.current.validateCustomPassword('pass', 'pass');
      
      expect(res).toBe(false);
      expect(toastModule.showToast).toHaveBeenCalledWith(
        expect.stringContaining('mínimo 8 caracteres'),
        'error'
      );
    });

    it('debe retornar false cuando passwords no coinciden', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      
      const res = result.current.validateCustomPassword('password123', 'password456');
      
      expect(res).toBe(false);
      expect(toastModule.showToast).toHaveBeenCalledWith(
        expect.stringContaining('no coinciden'),
        'error'
      );
    });

    it('debe retornar la password cuando es válida', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      
      const res = result.current.validateCustomPassword('password123', 'password123');
      
      expect(res).toBe('password123');
    });
  });

  describe('validateForm', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('debe retornar errores cuando faltan campos obligatorios', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      const formData = {
        nombre: '',
        email: '',
        cohorte: '',
        modulo: '',
      };

      const { isValid, errors } = result.current.validateForm(formData, []);

      expect(isValid).toBe(false);
      expect(errors).toHaveProperty('nombre');
      expect(errors).toHaveProperty('email');
    });

    it('debe validar formato de email', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      const formData = {
        nombre: 'Test User',
        email: 'invalid-email',
        cohorte: '1',
        modulo: 'JAVASCRIPT',
      };

      const { isValid, errors } = result.current.validateForm(formData, []);

      expect(isValid).toBe(false);
      expect(errors).toHaveProperty('email');
    });

    it('debe validar unicidad de email', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      const usuarios = [{ id: '1', email: 'existing@test.com' }];
      const formData = {
        nombre: 'Test User',
        email: 'existing@test.com',
        cohorte: '1',
        modulo: 'JAVASCRIPT',
      };

      const { isValid, errors } = result.current.validateForm(formData, usuarios);

      expect(isValid).toBe(false);
      expect(errors).toHaveProperty('email');
    });

    it('debe validar longitud mínima de identificador', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      const formData = {
        nombre: 'Test User',
        email: 'test@test.com',
        identificador: 'ab',
        cohorte: '1',
        modulo: 'JAVASCRIPT',
      };

      const { isValid, errors } = result.current.validateForm(formData, []);

      expect(isValid).toBe(false);
      expect(errors).toHaveProperty('identificador');
    });

    it('debe retornar isValid true cuando todos los datos son correctos', () => {
      const { result } = renderHook(() => useUsuarioValidation());
      const formData = {
        nombre: 'Test User',
        email: 'test@test.com',
        identificador: 'ABC123',
        cohorte: '1',
        modulo: 'JAVASCRIPT',
      };

      const { isValid, errors } = result.current.validateForm(formData, []);

      expect(isValid).toBe(true);
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });
});
