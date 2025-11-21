import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLoading } from '@/stores/loading.js'
import { useRouter } from 'vue-router'
import API from '@/services/axiosInterceptor.js'

export const useAuth = defineStore('auth', () => {
  const loadingStore = useLoading()
  const router = useRouter()

  const error = ref(null)
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('access_token') || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)

  const isLoggedIn = computed(() => {
    return !!accessToken.value // !! statement return true if user is not null, empty string or 0
  })

  const firstLetter = computed(() => {
    return user.value?.name?.charAt(0).toUpperCase() || null
  })

  const fetchCurrentUser = async () => {
    if (!accessToken.value) {
      user.value = null
      return
    }
    const res = await API.get('users/me/', {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    })
    user.value = res.data
  }

  const login = async (email, password) => {
    error.value = null
    loadingStore.isLoading = true
    try {
      const response = await API.post('token/', {
        email,
        password,
      })

      accessToken.value = response.data.access
      refreshToken.value = response.data.refresh

      localStorage.setItem('access_token', accessToken.value)
      localStorage.setItem('refresh_token', refreshToken.value)

      await fetchCurrentUser()
      router.push('/')
      loadingStore.isLoading = false
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          error.value = 'Credenciais inválidas. Tente novamente.'
        } else {
          error.value = 'Erro ao conectar com o servidor.'
        }
      } else {
        error.value = 'Erro desconhecido. Verifique sua conexão.'
      }
    } finally {
      loadingStore.isLoading = false
    }
  }

  const register = async (userData) => {
    error.value = null
    loadingStore.isLoading = true
    try {
      await API.post('users/', userData)
      await login(userData.email, userData.password)
    } catch (err) {
      if (err.response) {
        if (err.response.data.email) {
            error.value = 'Usuário já existe. Tente outro email.'
        }
        else if (err.response.status === 400) {
          error.value = 'Dados inválidos. Verifique os campos e tente novamente.'
        } else if (err.response.status === 401) {
            error.value = 'Não autorizado. Verifique suas credenciais.'
        }
         else if (err.response.status === 409) {
            error.value = 'Usuário já existe. Tente outro email.'
        } else {
          error.value = 'Erro ao conectar com o servidor.'
        }
      } else {
        error.value = 'Erro desconhecido. Verifique sua conexão.'
      }
    } finally {
      loadingStore.isLoading = false
    }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    error.value = null
  }

  return {
    error,
    user,
    isLoggedIn,
    firstLetter,
    login,
    register,
    fetchCurrentUser,
    logout,
  }
})
