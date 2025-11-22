import { defineStore } from 'pinia';
import { useAcervoStore } from './acervo'; // Integração para atualizar local do item

export const useMovementStore = defineStore('movements', {
  state: () => ({
    movements: [],
    loading: false,
    stats: {
        activeLoans: 0,
        overdue: 0
    }
  }),

  actions: {
    async fetchMovements(params = {}) {
      this.loading = true;
      try {
        // MOCK: axios.get('/api/movimentacoes/', { params })
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (this.movements.length === 0) {
             // Dados iniciais de exemplo
             this.movements = [
                {
                    id: 101,
                    item: { id: 1, titulo: 'Urna Funerária', numero_acervo: '2024.1.001' },
                    local_origem: { id: 1, nome_local: 'Reserva Técnica A' },
                    local_destino: { id: 2, nome_local: 'Sala de Exposição 1' },
                    responsavel_movimentacao: { id: 1, username: 'Admin' },
                    data_movimentacao: '2023-10-01T10:00:00',
                    tipo_movimento: 'INTERNO',
                    motivo: 'Exposição temporária',
                    previsao_retorno: null,
                    data_retorno_efetivo: null
                }
             ];
        }
        this.calculateStats();
      } finally {
        this.loading = false;
      }
    },

    async createMovement(payload) {
        this.loading = true;
        const acervoStore = useAcervoStore();
        try {
            // MOCK: axios.post('/api/movimentacoes/', payload)
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newMovement = {
                id: Date.now(),
                ...payload,
                data_movimentacao: new Date().toISOString(),
                data_retorno_efetivo: null,
                responsavel_movimentacao: { id: 1, username: 'Usuário Atual' } // Pegar do Auth
            };

            this.movements.unshift(newMovement);
            
            // ATUALIZA O LOCAL DO ITEM NO ACERVO AUTOMATICAMENTE
            if (acervoStore) {
                acervoStore.atualizarLocalizacaoItem(payload.item.id, payload.local_destino.nome_local);
            }

            this.calculateStats();
            return newMovement;
        } finally {
            this.loading = false;
        }
    },

    async registerReturn(id, returnData) {
        const index = this.movements.findIndex(m => m.id === id);
        if (index !== -1) {
            // MOCK: axios.patch(`/api/movimentacoes/${id}/return/`, returnData)
            await new Promise(resolve => setTimeout(resolve, 600));
            
            this.movements[index].data_retorno_efetivo = returnData.data_retorno_efetivo;
            this.movements[index].recebido_por = { id: 1, username: 'Admin' }; // Mock User
            
            // Lógica opcional: Atualizar item de volta para origem? 
            // Depende da regra de negócio. Geralmente cria-se uma nova movimentação de volta.
            
            this.calculateStats();
        }
    },

    calculateStats() {
        const today = new Date();
        this.stats.activeLoans = this.movements.filter(m => m.tipo_movimento === 'SAIDA_EXTERNA' && !m.data_retorno_efetivo).length;
        this.stats.overdue = this.movements.filter(m => 
            m.tipo_movimento === 'SAIDA_EXTERNA' && 
            !m.data_retorno_efetivo && 
            new Date(m.previsao_retorno) < today
        ).length;
    }
  }
});