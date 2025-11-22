import { defineStore } from 'pinia';

export const useLocationStore = defineStore('locations', {
  state: () => ({
    locations: [],
    loading: false,
    error: null,
  }),

  getters: {
    getLocationById: (state) => (id) => state.locations.find(l => l.id === id),
    sortedLocations: (state) => [...state.locations].sort((a, b) => a.nome_local.localeCompare(b.nome_local))
  },

  actions: {
    async fetchLocations() {
      this.loading = true;
      try {
        // MOCK: Substituir por axios.get('/api/localizacoes/')
        await new Promise(resolve => setTimeout(resolve, 500));
        if (this.locations.length === 0) {
            this.locations = [
                { id: 1, nome_local: 'Reserva Técnica A', tipo_ambiente: 'Reserva', capacidade_estimada: 1000 },
                { id: 2, nome_local: 'Sala de Exposição 1', tipo_ambiente: 'Exposição', capacidade_estimada: 50 },
                { id: 3, nome_local: 'Laboratório de Restauro', tipo_ambiente: 'Laboratório', capacidade_estimada: 20 },
                { id: 99, nome: 'Museu Nacional (RJ)', tipo_ambiente: 'Externo', capacidade_estimada: 0 },
            ];
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async createLocation(payload) {
      // MOCK: Substituir por axios.post('/api/localizacoes/', payload)
      await new Promise(resolve => setTimeout(resolve, 500));
      const newLoc = { id: Date.now(), ...payload };
      this.locations.push(newLoc);
      return newLoc;
    },

    async updateLocation(id, payload) {
      // MOCK: Substituir por axios.put(`/api/localizacoes/${id}/`, payload)
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = this.locations.findIndex(l => l.id === id);
      if (index !== -1) {
        this.locations[index] = { ...this.locations[index], ...payload };
      }
    },

    async deleteLocation(id) {
      // MOCK: Substituir por axios.delete(`/api/localizacoes/${id}/`)
      await new Promise(resolve => setTimeout(resolve, 500));
      this.locations = this.locations.filter(l => l.id !== id);
    }
  }
});