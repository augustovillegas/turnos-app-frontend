import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { UsuarioForm } from '../../../src/components/usuarios/UsuarioForm.jsx'
import { UsuarioEdit } from '../../../src/components/usuarios/UsuarioEdit.jsx'

// Minimal AppContext/AuthContext providers to inject mocks
import { AppProviders } from '../../../src/context/AppProviders.jsx'
import { AppContext } from '../../../src/context/AppContext.jsx'
import { AuthContext } from '../../../src/context/AuthContext.jsx'

function withProviders(ui, { appOverrides = {}, authOverrides = {} } = {}) {
  const appValue = {
    createUsuarioRemoto: vi.fn(async () => {}),
    updateUsuario: vi.fn(async () => {}),
    loadUsuarios: vi.fn(async () => {}),
    findUsuarioById: vi.fn(async () => authOverrides?.usuario ?? null),
    usuarios: [],
    ...appOverrides,
  }
  const authValue = {
    usuario: { id: 'admin-1', nombre: 'Admin', rol: 'superadmin' },
    ...authOverrides,
  }
  return (
    <AuthContext.Provider value={authValue}>
      <AppContext.Provider value={appValue}>{ui}</AppContext.Provider>
    </AuthContext.Provider>
  )
}

describe('Cohorte payloads', () => {
  it('UsuarioForm envía cohort y cohorte numéricos', async () => {
    const createUsuarioRemoto = vi.fn(async () => {})
    const loadUsuarios = vi.fn(async () => {})

    render(
      withProviders(<UsuarioForm onVolver={() => {}} />, {
        appOverrides: { createUsuarioRemoto, loadUsuarios },
        authOverrides: { usuario: { id: 'admin', nombre: 'SA', rol: 'superadmin' } },
      })
    )

    // Completar campos básicos
    fireEvent.change(screen.getByLabelText('Tipo de usuario'), { target: { value: 'alumno' } })
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Cohorte'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText('Módulo'), { target: { value: 'HTML-CSS' } })

    fireEvent.click(screen.getByTestId('btn-guardar'))

    // Validar payload
    expect(createUsuarioRemoto).toHaveBeenCalledTimes(1)
    const payload = createUsuarioRemoto.mock.calls[0][0]
    expect(payload).toMatchObject({
      cohort: 3,
      cohorte: 3,
    })
    expect(typeof payload.cohort).toBe('number')
    expect(typeof payload.cohorte).toBe('number')
  })

  it('UsuarioEdit envía cohort y cohorte numéricos', async () => {
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

    render(
      withProviders(<UsuarioEdit usuario={usuario} onVolver={() => {}} />, {
        appOverrides: { updateUsuario, loadUsuarios },
        authOverrides: { usuario: { id: 'admin', nombre: 'SA', rol: 'superadmin' } },
      })
    )

    // Cambiar cohorte
    fireEvent.change(screen.getByLabelText('Cohorte'), { target: { value: '5' } })

    // Guardar cambios
    fireEvent.click(screen.getByText('Guardar cambios'))

    // Confirmar modal: simulamos confirm llamando directamente a updateUsuario mediante avance de microtasks
    // Esperamos a que se dispare updateUsuario
    await new Promise((r) => setTimeout(r, 0))

    expect(updateUsuario).toHaveBeenCalled()
    const payload = updateUsuario.mock.calls[0][1]
    expect(payload).toMatchObject({ cohort: 5, cohorte: 5 })
    expect(typeof payload.cohort).toBe('number')
    expect(typeof payload.cohorte).toBe('number')
  })
})
