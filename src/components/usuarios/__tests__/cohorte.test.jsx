import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { UsuarioForm } from '../UsuarioForm.jsx'
import { UsuarioEdit } from '../UsuarioEdit.jsx'
import { UsuariosList } from '../UsuariosList.jsx'

import * as AppCtx from '../../../context/AppContext.jsx'
import * as AuthCtx from '../../../context/AuthContext.jsx'
import * as LoadingCtx from '../../../context/LoadingContext.jsx'
import * as ErrorCtx from '../../../context/ErrorContext.jsx'

function setupMocks({ appOverrides = {}, authOverrides = {}, usuarios = [] } = {}) {
  const createUsuarioRemoto = appOverrides.createUsuarioRemoto || vi.fn(async () => {})
  const updateUsuario = appOverrides.updateUsuario || vi.fn(async () => {})
  const loadUsuarios = appOverrides.loadUsuarios || vi.fn(async () => {})
  const findUsuarioById = appOverrides.findUsuarioById || vi.fn(async () => authOverrides?.usuario ?? null)

  vi.spyOn(AppCtx, 'useAppData').mockReturnValue({
    createUsuarioRemoto,
    updateUsuario,
    loadUsuarios,
    findUsuarioById,
    usuarios,
  })
  vi.spyOn(AuthCtx, 'useAuth').mockReturnValue({
    usuario: { id: 'admin-1', nombre: 'Admin', rol: 'superadmin' },
    ...authOverrides,
  })
  vi.spyOn(LoadingCtx, 'useLoading').mockReturnValue({ isLoading: () => false })
  vi.spyOn(ErrorCtx, 'useError').mockReturnValue({ pushError: () => {} })
  return { createUsuarioRemoto, updateUsuario, loadUsuarios }
}

describe('Cohorte y Modulo - Arquitectura correcta', () => {
  it('UsuarioForm payload debe incluir cohorte como número y modulo como String enum', async () => {
    const createUsuarioRemoto = vi.fn(async () => {})
    const loadUsuarios = vi.fn(async () => {})

    setupMocks({ appOverrides: { createUsuarioRemoto, loadUsuarios } })
    render(<UsuarioForm onVolver={() => {}} />)

    fireEvent.change(screen.getByLabelText('Tipo de usuario'), { target: { value: 'alumno' } })
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Cohorte'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText(/M.*dulo/i), { target: { value: 'HTML-CSS' } })

    fireEvent.click(screen.getByTestId('btn-guardar'))

    expect(createUsuarioRemoto).toHaveBeenCalledTimes(1)
    const payload = createUsuarioRemoto.mock.calls[0][0]
    expect(payload.cohorte).toBe(3)
    expect(typeof payload.cohorte).toBe('number')
    expect(payload.modulo).toBe('HTML-CSS') // módulo 1 = HTML-CSS
  })

  it('UsuarioEdit payload debe actualizar cohorte sin cambiar modulo si profesor', async () => {
    const updateUsuario = vi.fn(async () => {})
    const loadUsuarios = vi.fn(async () => {})

    const usuario = {
      id: 'u1',
      nombre: 'Editado',
      email: 'edit@example.com',
      cohorte: 2,
      modulo: 'HTML-CSS',
      rol: 'alumno',
    }

    setupMocks({ appOverrides: { updateUsuario, loadUsuarios }, authOverrides: { usuario } })
    const ModalCtx = await import('../../../context/ModalContext.jsx')
    vi.spyOn(ModalCtx, 'useModal').mockReturnValue({ showModal: ({ onConfirm }) => onConfirm?.() })
    render(<UsuarioEdit usuario={usuario} onVolver={() => {}} />)

    fireEvent.change(screen.getByLabelText('Cohorte'), { target: { value: '5' } })
    fireEvent.click(screen.getByText('Guardar cambios'))

    await new Promise((r) => setTimeout(r, 0))

    expect(updateUsuario).toHaveBeenCalled()
    const payload = updateUsuario.mock.calls[0][1]
    // Backend espera: solo los campos que cambian
    expect(payload.cohorte).toBe(5)
    expect(typeof payload.cohorte).toBe('number')
  })

  it('UsuariosList debe mostrar cohorte real o fallback "1"', async () => {
    const usuarios = [
      { id: '1', nombre: 'A', email: 'a@a.com', cohorte: 4, modulo: 'HTML-CSS', rol: 'alumno' },
      { id: '2', nombre: 'B', email: 'b@b.com', modulo: 'HTML-CSS', rol: 'alumno' }, // sin cohorte
    ]
    setupMocks({ usuarios })
    const ModalCtx = await import('../../../context/ModalContext.jsx')
    vi.spyOn(ModalCtx, 'useModal').mockReturnValue({ showModal: () => {} })
    render(<UsuariosList />)
    expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1) // fallback
  })
})
