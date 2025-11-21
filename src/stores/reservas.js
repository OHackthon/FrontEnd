import { defineStore } from 'pinia'
import { ref } from 'vue'
import ReservasApi from '@/services/reservasApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'

const loadingStore = useLoading()
const modalStore = useModalStore()
const reservasApi = new ReservasApi()

export const useReservasStore = defineStore('reservas', () => {
  const reservas = ref([])

  const movimentoOptions = ref([
    { value: 'INTERNO', label: 'Movimentação interna' },
    { value: 'EXTERNA', label: 'Saída externa / Empréstimo' },
  ])

  const newReserva = ref({
    id: null,
    item: null, //fk
    responsavel: null, //fk
    local_origem: null, //fk
    local_destino: null, //fk
    data_movimentacao: null,
    tipo_movimento: '',
  })

  const fetchReservas = async () => {
    loadingStore.isLoading = true
    const data = await reservasApi.fetchReservas()
    reservas.value = Array.isArray(data.results) ? [...data.results] : [...data]
    loadingStore.isLoading = false
  }

  const createReserva = async (reserva) => {
    try {
      loadingStore.isLoading = true
      const created = await reservasApi.createReserva(reserva)
      reservas.value.push(created)

      newReserva.value = {
        id: null,
        item: null, //fk
        responsavel: null, //fk
        local_origem: null, //fk
        local_destino: null, //fk
        data_movimentacao: null,
        tipo_movimento: '',
      }

      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error creating reserva', err)
      loadingStore.isLoading = false
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
