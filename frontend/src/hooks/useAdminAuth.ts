import { useState, useEffect } from 'react'

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('admin_token')
  })

  const login = (token: string) => {
    localStorage.setItem('admin_token', token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
  }

  return { isAuthenticated, login, logout }
}