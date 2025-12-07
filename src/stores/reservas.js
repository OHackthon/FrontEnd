import { defineStore } from 'pinia'
import { ref } from 'vue'
import ReservasApi from '@/services/reservasApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'
import { useAuth } from '@/stores/auth.js'
import { useNotificationStore } from '@/stores/notification.js'
const authStore = useAuth()
const loadingStore = useLoading()
const modalStore = useModalStore()
const notificationStore = useNotificationStore()
const reservasApi = new ReservasApi()
export const useReservasStore = defineStore('reservas', () => {
  const reservas = ref([])
  const movimentoOptions = ref([
    { value: 'INTERNO', label: 'Movimentação interna' },
    { value: 'EXTERNA', label: 'Saída externa / Empréstimo' },
  ])
  const newReserva = ref({
    id: null,
    item: null, 
    responsavel: authStore.user, 
    local_origem: null, 
    local_destino: null, 
    data_movimentacao: new Date().toISOString(),
    tipo_movimento: '',
  })
  const fetchReservas = async () => {
    loadingStore.isLoading = true
    try {
      const data = await reservasApi.fetchReservas()
      reservas.value = Array.isArray(data.results) ? [...data.results] : [...data]
    } catch (error) {
      console.error('Erro ao buscar reservas:', error)
    } finally {
      loadingStore.isLoading = false
    }
  }
  const createReserva = async (reserva) => {
    try {
      loadingStore.isLoading = true
      if (!reserva.responsavel && authStore.user) {
        reserva.responsavel = authStore.user.id
      } else if (typeof reserva.responsavel === 'object' && reserva.responsavel !== null) {
        reserva.responsavel = reserva.responsavel.id
      }
      const created = await reservasApi.createReserva(reserva)
      reservas.value.push(created)
      notificationStore.showSuccess('Reserva criada com sucesso!')
      newReserva.value = {
        id: null,
        item: null, 
        responsavel: null, 
        local_origem: null, 
        local_destino: null, 
        data_movimentacao: null,
        tipo_movimento: '',
      }
      loadingStore.isLoading = false
      return true
    } catch (err) {
      console.error('Error creating reserva', err)
      notificationStore.showError('Erro ao criar reserva. Verifique os dados.')
      loadingStore.isLoading = false
      return false
    }
  }
  const updateReserva = async () => {
    try {
      loadingStore.isLoading = true
      await reservasApi.updateReserva(modalStore.editingItem)
      await fetchReservas()
      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error updating reserva: ', err)
      loadingStore.isLoading = false
    }
  }
  const deleteReserva = async (id) => {
    try {
      loadingStore.isLoading = true
      await reservasApi.deleteReserva(id)
      reservas.value = reservas.value.filter((reserva) => reserva.id !== id)
      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting reserva:', err)
      loadingStore.isLoading = false
    }
  }
  return {
    reservas,
    newReserva,
    fetchReservas,
    createReserva,
    updateReserva,
    deleteReserva,
    movimentoOptions,
  }
})