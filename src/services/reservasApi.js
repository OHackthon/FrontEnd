import API from '@/services/axiosInterceptor.js'

export default class ReservasApi {
    async fetchReservas() {
        const { data } = await API.get('reservas/')
        return data
    }
    async createReserva(reserva) {
        const { data } = await API.post('reservas/', reserva)
        return data
    }
    async updateReserva(reserva) {
        const { data } = await API.put(`reservas/${reserva.id}/`, reserva)
        return data
    }
    async deleteReserva(id) {
        await API.delete(`reservas/${id}/`)
    }
}