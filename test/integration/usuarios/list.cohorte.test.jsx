import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

import UsuariosList from '../../../src/components/usuarios/UsuariosList.jsx'
import { AppContext } from '../../../src/context/AppContext.jsx'
import { AuthContext } from '../../../src/context/AuthContext.jsx'

function withProviders(ui, { usuarios = [] } = {}) {
  const appValue = {
    usuarios,
    loadUsuarios: async () => {},
  }
  const authValue = { usuario: { id: 'sa', nombre: 'SA', rol: 'superadmin' } }
  return (
    <AuthContext.Provider value={authValue}>
      <AppContext.Provider value={appValue}>{ui}</AppContext.Provider>
    </AuthContext.Provider>
  )
}

describe('UsuariosList cohorte display', () => {
  it('muestra cohorte real cuando existe', () => {
    const usuarios = [
      { id: '1', nombre: 'A', email: 'a@a.com', cohorte: 4, modulo: 'HTML-CSS', rol: 'alumno' },
    ]
    render(withProviders(<UsuariosList />, { usuarios }))
    expect(screen.getByText('4')).toBeTruthy()
  })

  it('fallback a 1 cuando falta cohorte', () => {
    const usuarios = [
      { id: '2', nombre: 'B', email: 'b@b.com', modulo: 'HTML-CSS', rol: 'alumno' },
    ]
    render(withProviders(<UsuariosList />, { usuarios }))
    // Busca cualquier celda que contenga "1" como cohorte por defecto
    expect(screen.getByText('1')).toBeTruthy()
  })
})
