<template>
  <div class="museu-acervo-profissional">
    <header class="header">
      <h1>🏛️ Museu do Sambaqui - Acervo Digital</h1>
      <p>Sistema de consulta com arquitetura profissional</p>
    </header>
    <div class="filtros-container">
      <h2>🔍 Filtros de Busca</h2>
      <div class="filtro-group">
        <label for="buscaGeral">Busca Geral:</label>
        <input
          id="buscaGeral"
          v-model="itemAcervoStore.filtros.busca_geral"
          type="text"
          placeholder="Digite: cerâmica, lítico, sambaqui..."
          @input="debounceSearch"
        />
      </div>
      <div class="filtro-group">
        <label for="estado">Estado de Conservação:</label>
        <select 
          id="estado" 
          :value="itemAcervoStore.filtros.estado_conservacao" 
          @change="itemAcervoStore.aplicarFiltro('estado_conservacao', $event.target.value)"
        >
          <option value="">Todos os estados</option>
          <option value="BOM">Bom</option>
          <option value="REGULAR">Regular</option>
          <option value="FRAGMENTADO">Fragmentado</option>
          <option value="DETERIORADO">Deteriorado</option>
        </select>
      </div>
      <div class="filtro-group">
        <label for="colecao">Coleção:</label>
        <select 
          id="colecao" 
          :value="itemAcervoStore.filtros.colecao" 
          @change="itemAcervoStore.aplicarFiltro('colecao', $event.target.value)"
        >
          <option value="">Todas as coleções</option>
          <option 
            v-for="colecao in colecaoStore.colecoesComItens" 
            :key="colecao.id" 
            :value="colecao.id"
          >
            {{ colecao.nome_colecao }} ({{ colecao.quantidade_itens }} itens)
          </option>
        </select>
      </div>
      <div class="filtro-group">
        <label for="materiaPrima">Matéria-Prima:</label>
        <select 
          id="materiaPrima" 
          :value="itemAcervoStore.filtros.materia_prima" 
          @change="itemAcervoStore.aplicarFiltro('materia_prima', $event.target.value)"
        >
          <option value="">Todas as matérias-primas</option>
          <option 
            v-for="materia in materiaPrimaStore.materiasPrimas" 
            :key="materia.id" 
            :value="materia.id"
          >
            {{ materia.nome_materia }}
          </option>
        </select>
      </div>
      <div class="filtro-group">
        <label for="procedencia">Procedência:</label>
        <input
          id="procedencia"
          v-model="itemAcervoStore.filtros.procedencia"
          type="text"
          placeholder="Ex: Laguna, Florianópolis..."
          @input="debounceSearch"
        />
      </div>
      <div class="filtro-group">
        <label for="datacao">Período/Datação:</label>
        <input
          id="datacao"
          v-model="itemAcervoStore.filtros.datacao"
          type="text"
          placeholder="Ex: pré-colonial, 1500..."
          @input="debounceSearch"
        />
      </div>
      <button @click="itemAcervoStore.limparFiltros()" class="btn-limpar">
        🗑️ Limpar Filtros
      </button>
    </div>
    <div v-if="loadingStore.isLoading" class="loading">
      ⏳ Carregando...
    </div>
    <div v-else class="status-busca">
      <p v-if="itemAcervoStore.itensAcervo.length === 0">
        📭 Nenhum item encontrado com os filtros aplicados
      </p>
      <p v-else>
        📊 {{ itemAcervoStore.paginacao.totalItens }} item(ns) encontrado(s)
        - Página {{ itemAcervoStore.paginacao.paginaAtual }} de {{ itemAcervoStore.paginacao.totalPaginas }}
      </p>
    </div>
    <div class="itens-grid">
      <div v-for="item in itemAcervoStore.itensAcervo" :key="item.id" class="item-card">
        <div class="item-imagem">
          <img v-if="item.imagem" :src="item.imagem" :alt="item.titulo" />
          <div v-else class="sem-imagem">🏺</div>
        </div>
        <div class="item-info">
          <h3>{{ item.titulo || "Sem título" }}</h3>
          <div class="item-detalhes">
            <p><strong>ID:</strong> #{{ item.id }}</p>
            <p v-if="item.procedencia">
              <strong>Procedência:</strong> {{ item.procedencia }}
            </p>
            <p v-if="item.datacao"><strong>Datação:</strong> {{ item.datacao }}</p>
            <p>
              <strong>Estado:</strong>
              <span :class="`status-${item.estado_conservacao.toLowerCase()}`">
                {{ getEstadoLabel(item.estado_conservacao) }}
              </span>
            </p>
            <p v-if="item.colecao_nome">
              <strong>Coleção:</strong> {{ item.colecao_nome }}
            </p>
            <p v-if="item.materia_prima_nome">
              <strong>Material:</strong> {{ item.materia_prima_nome }}
            </p>
          </div>
          <p v-if="item.descricao" class="item-descricao">
            {{
              item.descricao.length > 100
                ? item.descricao.substring(0, 100) + "..."
                : item.descricao
            }}
          </p>
        </div>
      </div>
    </div>
    <div v-if="itemAcervoStore.paginacao.totalPaginas > 1" class="paginacao">
      <button
        @click="itemAcervoStore.mudarPagina(itemAcervoStore.paginacao.paginaAtual - 1)"
        :disabled="itemAcervoStore.paginacao.paginaAtual === 1"
        class="btn-pagina"
      >
        ← Anterior
      </button>
      <span class="pagina-info">
        Página {{ itemAcervoStore.paginacao.paginaAtual }} de {{ itemAcervoStore.paginacao.totalPaginas }}
      </span>
      <button
        @click="itemAcervoStore.mudarPagina(itemAcervoStore.paginacao.paginaAtual + 1)"
        :disabled="itemAcervoStore.paginacao.paginaAtual === itemAcervoStore.paginacao.totalPaginas"
        class="btn-pagina"
      >
        Próxima →
      </button>
    </div>
    <div v-if="itemAcervoStore.temFiltrosAtivos()" class="filtros-ativos">
      <h3>🏷️ Filtros Aplicados:</h3>
      <div class="tags-filtros">
        <span v-if="itemAcervoStore.filtros.busca_geral" class="tag">
          Busca: "{{ itemAcervoStore.filtros.busca_geral }}"
        </span>
        <span v-if="itemAcervoStore.filtros.estado_conservacao" class="tag">
          Estado: {{ getEstadoLabel(itemAcervoStore.filtros.estado_conservacao) }}
        </span>
        <span v-if="itemAcervoStore.filtros.colecao" class="tag">
          Coleção: {{ colecaoStore.getColecaoNome(itemAcervoStore.filtros.colecao) }}
        </span>
        <span v-if="itemAcervoStore.filtros.materia_prima" class="tag">
          Material: {{ materiaPrimaStore.getMateriaPrimaNome(itemAcervoStore.filtros.materia_prima) }}
        </span>
        <span v-if="itemAcervoStore.filtros.procedencia" class="tag">
          Procedência: "{{ itemAcervoStore.filtros.procedencia }}"
        </span>
        <span v-if="itemAcervoStore.filtros.datacao" class="tag">
          Datação: "{{ itemAcervoStore.filtros.datacao }}"
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import { useItemAcervoStore } from '@/stores/itemAcervoStore'
import { useColecaoStore } from '@/stores/colecaoStore'
import { useMateriaPrimaStore } from '@/stores/materiaPrimaStore'
import { useLoading } from '@/stores/loading.js'
export default {
  name: "MuseuAcervoProfissional",
  setup() {
    const itemAcervoStore = useItemAcervoStore()
    const colecaoStore = useColecaoStore()
    const materiaPrimaStore = useMateriaPrimaStore()
    const loadingStore = useLoading()
    return {
      itemAcervoStore,
      colecaoStore,
      materiaPrimaStore,
      loadingStore
    }
  },
  data() {
    return {
      debounceTimer: null
    }
  },
  async mounted() {
    await Promise.all([
      this.colecaoStore.fetchColecoesComItens(),
      this.materiaPrimaStore.fetchMateriasPrimas(),
      this.itemAcervoStore.buscarItensComFiltros()
    ])
  },
  methods: {
    debounceSearch() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      this.debounceTimer = setTimeout(() => {
        this.itemAcervoStore.buscarItensComFiltros()
      }, 500)
    },
    getEstadoLabel(estado) {
      const labels = {
        BOM: "Bom",
        REGULAR: "Regular", 
        FRAGMENTADO: "Fragmentado",
        DETERIORADO: "Deteriorado"
      }
      return labels[estado] || estado
    }
  }
}
</script>
<style scoped>
.museu-acervo-profissional {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #8b4513, #d2691e);
  color: white;
  border-radius: 10px;
}
.header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
}
.header p {
  margin: 0;
  font-size: 1.2em;
  opacity: 0.9;
}
.filtros-container {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
}
.filtros-container h2 {
  margin-top: 0;
  color: #495057;
}
.filtro-group {
  margin-bottom: 15px;
}
.filtro-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #495057;
}
.filtro-group input,
.filtro-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  font-size: 14px;
}
.filtro-group input:focus,
.filtro-group select:focus {
  outline: none;
  border-color: #8b4513;
  box-shadow: 0 0 0 0.2rem rgba(139, 69, 19, 0.25);
}
.btn-limpar {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
}
.btn-limpar:hover {
  background: #c82333;
}
.loading {
  text-align: center;
  font-size: 1.2em;
  font-weight: 600;
  color: #6c757d;
  margin: 20px 0;
}
.status-busca {
  text-align: center;
  margin: 20px 0;
  font-weight: 600;
  color: #6c757d;
}
.itens-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}
.item-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}
.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.item-imagem {
  height: 200px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.item-imagem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sem-imagem {
  font-size: 3em;
  color: #adb5bd;
}
.item-info {
  padding: 15px;
}
.item-info h3 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 1.1em;
}
.item-detalhes p {
  margin: 5px 0;
  font-size: 0.9em;
  color: #6c757d;
}
.item-detalhes strong {
  color: #495057;
}
.status-bom { color: #28a745; font-weight: 600; }
.status-regular { color: #ffc107; font-weight: 600; }
.status-fragmentado { color: #fd7e14; font-weight: 600; }
.status-deteriorado { color: #dc3545; font-weight: 600; }
.item-descricao {
  margin-top: 10px;
  font-size: 0.9em;
  color: #6c757d;
  font-style: italic;
}
.paginacao {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 30px 0;
}
.btn-pagina {
  padding: 8px 16px;
  border: 1px solid #8b4513;
  background: white;
  color: #8b4513;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}
.btn-pagina:hover:not(:disabled) {
  background: #8b4513;
  color: white;
}
.btn-pagina:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagina-info {
  font-weight: 600;
  color: #495057;
}
.filtros-ativos {
  background: #e9ecef;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
}
.filtros-ativos h3 {
  margin: 0 0 10px 0;
  color: #495057;
}
.tags-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tag {
  background: #8b4513;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9em;
  font-weight: 600;
}
@media (max-width: 768px) {
  .museu-acervo-profissional {
    padding: 10px;
  }
  .header h1 {
    font-size: 2em;
  }
  .header p {
    font-size: 1em;
  }
  .itens-grid {
    grid-template-columns: 1fr;
  }
  .paginacao {
    flex-direction: column;
    gap: 10px;
  }
  .tags-filtros {
    justify-content: center;
  }
}
</style>