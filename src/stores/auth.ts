import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import path from '@/plugins/path'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.roles?.includes('admin'))
  const isDelivery = computed(() => user.value?.roles?.includes('delivery'))
  const isCustomer = computed(() => !isAdmin.value && !isDelivery.value && user.value?.roles?.includes('customer'))

  // Login
  const login = async (email: string, password: string) => {
  isLoading.value = true
  try {
    const response = await path.post(`/login`, { email, password })
    const userData = response.data.user
    user.value = userData
    console.log('User data:', userData)

    const role = userData.roles?.[0]?.name || 'unknown'
    console.log('User role:', role)

    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('role', role)
    localStorage.setItem('token', response.data.token)

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erreur lors de la connexion'
    }
  } finally {
    isLoading.value = false
  }
}

  // Register
  const register = async (name: string, email: string, password: string) => {
    isLoading.value = true
    try {
      const response = await path.post(`/register`, {
        name,
        email,
        password
      })

      const userData = response.data.user
      const role = response.data.role;

      user.value = userData
      localStorage.setItem('user', JSON.stringify({userData, role}))
      localStorage.setItem('token', response.data.token)

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de l’inscription'
      }
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // Check auth status
 

  // Initialize auth state
  const init = () => {
    // const token = localStorage.getItem('token')
    // const userData = localStorage.getItem('user')
    // if (token && userData) {
    //   user.value = JSON.parse(userData)
    //   // Verify token is still valid
    //   checkAuth()
    // }

      const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isDelivery,
    isCustomer,
    login,
    register,
    logout,
    init
  }
})