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

describe('Cohorte handling', () => {
  it('UsuarioForm payload includes cohort and cohorte as numbers', async () => {
    const createUsuarioRemoto = vi.fn(async () => {})
    const loadUsuarios = vi.fn(async () => {})

    setupMocks({ appOverrides: { createUsuarioRemoto, loadUsuarios } })
    render(<UsuarioForm onVolver={() => {}} />)

    fireEvent.change(screen.getByLabelText('Tipo de usuario'), { target: { value: 'alumno' } })
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Cohorte'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText('Módulo'), { target: { value: 'HTML-CSS' } })

    fireEvent.click(screen.getByTestId('btn-guardar'))

    expect(createUsuarioRemoto).toHaveBeenCalledTimes(1)
    const payload = createUsuarioRemoto.mock.calls[0][0]
    expect(payload).toMatchObject({ cohort: 3 })
    expect(typeof payload.cohort).toBe('number')
  })

  it('UsuarioEdit payload includes cohort and cohorte when saving', async () => {
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
    // Mock useModal to auto-confirm
    const ModalCtx = await import('../../../context/ModalContext.jsx')
    vi.spyOn(ModalCtx, 'useModal').mockReturnValue({ showModal: ({ onConfirm }) => onConfirm?.() })
    render(<UsuarioEdit usuario={usuario} onVolver={() => {}} />)

    fireEvent.change(screen.getByLabelText('Cohorte'), { target: { value: '5' } })
    fireEvent.click(screen.getByText('Guardar cambios'))

    await new Promise((r) => setTimeout(r, 0))

    expect(updateUsuario).toHaveBeenCalled()
    const payload = updateUsuario.mock.calls[0][1]
    expect(payload).toMatchObject({ cohort: 5, cohorte: 5 })
    expect(typeof payload.cohort).toBe('number')
    expect(typeof payload.cohorte).toBe('number')
  })

  it('UsuariosList shows real cohort or fallback to 1', async () => {
    const usuarios = [
      { id: '1', nombre: 'A', email: 'a@a.com', cohorte: 4, modulo: 'HTML-CSS', rol: 'alumno' },
      { id: '2', nombre: 'B', email: 'b@b.com', modulo: 'HTML-CSS', rol: 'alumno' },
    ]
    setupMocks({ usuarios })
    const ModalCtx = await import('../../../context/ModalContext.jsx')
    vi.spyOn(ModalCtx, 'useModal').mockReturnValue({ showModal: () => {} })
    render(<UsuariosList />)
    expect(screen.getByText('4')).toBeTruthy()
    expect(screen.getByText('1')).toBeTruthy()
  })
})
