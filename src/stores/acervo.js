import { defineStore } from 'pinia'

export const useAcervoStore = defineStore('acervo', {
  state: () => ({
    loading: false,

    colecoes: [
      { id: 1, nome: 'Coleção Guilherme Tiburtius' },
      { id: 2, nome: 'Coleção Sambaqui de Joinville' },
      { id: 3, nome: 'Coleção Etnológica Indígena' },
      { id: 4, nome: 'Doações Diversas' },
    ],

    materiasPrimas: [
      { id: 1, termo: 'Mineral' },
      { id: 2, termo: 'Vegetal' },
      { id: 3, termo: 'Animal' },
      { id: 4, termo: 'Outro' },
    ],

    subtipos: [],

    localizacoes: [
      { id: 1, nome: 'Reserva Técnica A - Estante 01' },
      { id: 2, nome: 'Reserva Técnica B - Armário de Aço' },
      { id: 3, nome: 'Sala de Exposição Permanente' },
      { id: 4, nome: 'Laboratório de Restauro' },
    ],

    itens: [
      {
        id: 101,
        numero_acervo: '2024.1.001',
        titulo: 'Urna Funerária Marajoara',
        colecao_id: 1,
        materia_prima_id: 1,
        subtipo_id: 1,
        localizacao_atual_id: 3,
        procedencia: 'Sítio Arqueológico do Sambaqui (Joinville/SC)',
        datacao: '1.200 AP',
        estado_conservacao: 'Fragmentado (Restaurado)',
        descricao: 'Urna funerária de grandes dimensões com decoração geométrica.',
        observacoes: 'Peça icônica da coleção.',
        img: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=500',
      },
      {
        id: 102,
        numero_acervo: '2024.1.002',
        titulo: 'Ponta de Flecha Bifacial',
        colecao_id: 2,
        materia_prima_id: 1,
        subtipo_id: 2,
        localizacao_atual_id: 1,
        procedencia: 'Sambaqui do Rio Comprido',
        datacao: '2.000 AP',
        estado_conservacao: 'Bom',
        descricao: 'Artefato lítico lascado em quartzo hialino.',
        observacoes: '',
        img: 'https://images.unsplash.com/photo-1596627727361-9f93976378c2?w=500',
      },
      {
        id: 103,
        numero_acervo: '2024.2.015',
        titulo: 'Cesto Trançado Guarani',
        colecao_id: 3,
        materia_prima_id: 2,
        subtipo_id: 4,
        localizacao_atual_id: 2,
        procedencia: 'Aldeia Tarumã',
        datacao: 'Século XX',
        estado_conservacao: 'Regular',
        descricao: 'Cesto de carga confeccionado em taquara.',
        observacoes: 'Apresenta rompimento nas fibras da base.',
        img: 'https://images.unsplash.com/photo-1516216628859-9bccecab13ca?w=500',
      },
      {
        id: 104,
        numero_acervo: '2024.3.088',
        titulo: 'Colar de Vértebras de Peixe',
        colecao_id: 1,
        materia_prima_id: 3,
        subtipo_id: 9,
        localizacao_atual_id: 3,
        procedencia: 'Sambaqui Morro do Ouro',
        datacao: '3.000 AP',
        estado_conservacao: 'Bom',
        descricao: 'Colar composto por 150 vértebras de peixe polidas.',
        observacoes: 'Fio substituído em restauro anterior.',
        img: 'https://images.unsplash.com/photo-1606103920295-9a091573f160?w=500',
      },
      {
        id: 105,
        numero_acervo: '2024.4.012',
        titulo: 'Lâmina de Machado Polida',
        colecao_id: 2,
        materia_prima_id: 1,
        subtipo_id: 3,
        localizacao_atual_id: 1,
        procedencia: 'Desconhecida',
        datacao: 'Indeterminada',
        estado_conservacao: 'Excelente',
        descricao: 'Lâmina de machado em diabásio com polimento integral.',
        observacoes: '',
        img: 'https://images.unsplash.com/photo-1523554888454-84137e72d3ce?w=500',
      },
      {
        id: 106,
        numero_acervo: '2024.5.099',
        titulo: 'Fóssil de Peixe (Dastilbe)',
        colecao_id: 1,
        materia_prima_id: 3,
        subtipo_id: 8,
        localizacao_atual_id: 3,
        procedencia: 'Bacia do Araripe',
        datacao: 'Cretáceo',
        estado_conservacao: 'Fragmentado',
        descricao: 'Nódulo calcário contendo fóssil de peixe.',
        observacoes: '',
        img: 'https://images.unsplash.com/photo-1550948537-130a1ce83314?w=500',
      },
    ],
  }),

  getters: {
    itensCompletos: (state) => {
      return state.itens.map((item) => {
        const colecao = state.colecoes.find((c) => c.id === item.colecao_id)
        const materia = state.materiasPrimas.find((m) => m.id === item.materia_prima_id)
        const subtipo = state.subtipos.find((s) => s.id === item.subtipo_id)
        const local = state.localizacoes.find((l) => l.id === item.localizacao_atual_id)

        return {
          ...item,
          colecao: colecao ? colecao.nome : 'Desconhecida',
          materia: materia ? materia.termo : 'Indefinido',
          materia_prima: materia ? materia.termo : 'Indefinido',
          subtipo: subtipo ? subtipo.termo : '',
          localizacao: local ? local.nome : 'Não registrado',
        }
      })
    },

    opcoesDeFiltro: (state) => {
      return {
        colecao: state.colecoes.map((c) => c.nome),
        materia: state.materiasPrimas.map((m) => m.termo),
        subtipo: state.subtipos.map((s) => s.termo),
        localizacao: state.localizacoes.map((l) => l.nome),
        estado: ['Bom', 'Regular', 'Fragmentado', 'Excelente', 'Fragmentado (Restaurado)'],
      }
    },
  },

  actions: {
    async fetchItens() {
      this.loading = true
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.loading = false
    },

    getItemPorId(id) {
      return this.itensCompletos.find((i) => i.id == id)
    },
  },
})
