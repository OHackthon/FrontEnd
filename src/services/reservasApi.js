import API from '@/services/axiosInterceptor.js'

export default class ReservasApi {
    async fetchReservas() {
        const response = await API.get('reservas/')
        return response.data
    }
    async createReserva(reserva) {
        const response = await API.post('reservas/', reserva)
        return response.data
    }
    async updateReserva(reserva) {
        const response = await API.put(`reservas/${reserva.id}/`, reserva)
        return response.data
    }
    async deleteReserva(id) {
        await API.delete(`reservas/${id}/`)
    }
}