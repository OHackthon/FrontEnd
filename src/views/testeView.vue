<script>
import axios from "axios";
export default {
  name: "MuseuAcervo",
  data() {
    return {
      filtros: {
        busca_geral: "",
        estado_conservacao: "",
        colecao: "",
        procedencia: "",
        datacao: "",
      },
      itens: [],
      colecoes: [],
      loading: false,
      paginaAtual: 1,
      totalPaginas: 1,
      itensPorPagina: 12,
      debounceTimer: null,
    };
  },
  computed: {
    temFiltrosAtivos() {
      return Object.values(this.filtros).some((valor) => valor !== "");
    },
  },
  async mounted() {
    await this.carregarColecoes();
    await this.buscarItens();
  },
  methods: {
    async carregarColecoes() {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/colecoes/?tem_itens=true"
        );
        this.colecoes = response.data.results || response.data;
      } catch (error) {
        console.error("Erro ao carregar coleções:", error);
        this.colecoes = [];
      }
    },
    buscarItens() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.executarBusca();
      }, 500); 
    },
    async executarBusca() {
      this.loading = true;
      try {
        const params = new URLSearchParams();
        if (this.filtros.busca_geral) {
          params.append("busca_geral", this.filtros.busca_geral);
        }
        if (this.filtros.estado_conservacao) {
          params.append("estado_conservacao", this.filtros.estado_conservacao);
        }
        if (this.filtros.colecao) {
          params.append("colecao", this.filtros.colecao);
        }
        if (this.filtros.procedencia) {
          params.append("procedencia__icontains", this.filtros.procedencia);
        }
        if (this.filtros.datacao) {
          params.append("datacao__icontains", this.filtros.datacao);
        }
        params.append("page", this.paginaAtual);
        params.append("page_size", this.itensPorPagina);
        const url = `http://localhost:8000/api/itens-acervo/?${params.toString()}`;
        console.log("🔍 Buscando:", url);
        const response = await axios.get(url);
        if (response.data.results) {
          this.itens = response.data.results;
          this.totalPaginas = Math.ceil(response.data.count / this.itensPorPagina);
        } else {
          this.itens = response.data;
          this.totalPaginas = 1;
        }
      } catch (error) {
        console.error("❌ Erro na busca:", error);
        this.itens = [];
      } finally {
        this.loading = false;
      }
    },
    limparFiltros() {
      this.filtros = {
        busca_geral: "",
        estado_conservacao: "",
        colecao: "",
        procedencia: "",
        datacao: "",
      };
      this.paginaAtual = 1;
      this.buscarItens();
    },
    mudarPagina(novaPagina) {
      if (novaPagina >= 1 && novaPagina <= this.totalPaginas) {
        this.paginaAtual = novaPagina;
        this.executarBusca();
      }
    },
    getEstadoLabel(estado) {
      const labels = {
        BOM: "Bom",
        REGULAR: "Regular",
        FRAGMENTADO: "Fragmentado",
        DETERIORADO: "Deteriorado",
      };
      return labels[estado] || estado;
    },
    getColecaoNome(colecaoId) {
      const colecao = this.colecoes.find((c) => c.id === parseInt(colecaoId));
      return colecao ? colecao.nome_colecao : "Desconhecida";
    },
  },
};
</script>
<template>
  <div class="museu-acervo">
    <header class="header">
      <h1>🏛️ Museu do Sambaqui - Acervo Digital</h1>
      <p>Explore nossa coleção de artefatos arqueológicos</p>
    </header>
    <div class="filtros-container">
      <h2>🔍 Filtros de Busca</h2>
      <div class="filtro-group">
        <label for="buscaGeral">Busca Geral:</label>
        <input
          id="buscaGeral"
          v-model="filtros.busca_geral"
          type="text"
          placeholder="Digite: cerâmica, lítico, sambaqui..."
          @input="buscarItens"
        />
      </div>
      <div class="filtro-group">
        <label for="estado">Estado de Conservação:</label>
        <select id="estado" v-model="filtros.estado_conservacao" @change="buscarItens">
          <option value="">Todos os estados</option>
          <option value="BOM">Bom</option>
          <option value="REGULAR">Regular</option>
          <option value="FRAGMENTADO">Fragmentado</option>
          <option value="DETERIORADO">Deteriorado</option>
        </select>
      </div>
      <div class="filtro-group">
        <label for="colecao">Coleção:</label>
        <select id="colecao" v-model="filtros.colecao" @change="buscarItens">
          <option value="">Todas as coleções</option>
          <option v-for="colecao in colecoes" :key="colecao.id" :value="colecao.id">
            {{ colecao.nome_colecao }} ({{ colecao.quantidade_itens }} itens)
          </option>
        </select>
      </div>
      <div class="filtro-group">
        <label for="procedencia">Procedência:</label>
        <input
          id="procedencia"
          v-model="filtros.procedencia"
          type="text"
          placeholder="Ex: Laguna, Florianópolis..."
          @input="buscarItens"
        />
      </div>
      <div class="filtro-group">
        <label for="datacao">Período/Datação:</label>
        <input
          id="datacao"
          v-model="filtros.datacao"
          type="text"
          placeholder="Ex: pré-colonial, 1500..."
          @input="buscarItens"
        />
      </div>
      <button @click="limparFiltros" class="btn-limpar">🗑️ Limpar Filtros</button>
    </div>
    <div class="status-busca">
      <p v-if="loading">⏳ Carregando...</p>
      <p v-else-if="itens.length === 0 && !loading">
        📭 Nenhum item encontrado com os filtros aplicados
      </p>
      <p v-else>📊 {{ itens.length }} item(ns) encontrado(s)</p>
    </div>
    <div class="itens-grid">
      <div v-for="item in itens" :key="item.id" class="item-card">
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
    <div v-if="totalPaginas > 1" class="paginacao">
      <button
        @click="mudarPagina(paginaAtual - 1)"
        :disabled="paginaAtual === 1"
        class="btn-pagina"
      >
        ← Anterior
      </button>
      <span class="pagina-info"> Página {{ paginaAtual }} de {{ totalPaginas }} </span>
      <button
        @click="mudarPagina(paginaAtual + 1)"
        :disabled="paginaAtual === totalPaginas"
        class="btn-pagina"
      >
        Próxima →
      </button>
    </div>
    <div v-if="temFiltrosAtivos" class="filtros-ativos">
      <h3>🏷️ Filtros Aplicados:</h3>
      <div class="tags-filtros">
        <span v-if="filtros.busca_geral" class="tag">
          Busca: "{{ filtros.busca_geral }}" ✕
        </span>
        <span v-if="filtros.estado_conservacao" class="tag">
          Estado: {{ getEstadoLabel(filtros.estado_conservacao) }} ✕
        </span>
        <span v-if="filtros.colecao" class="tag">
          Coleção: {{ getColecaoNome(filtros.colecao) }} ✕
        </span>
        <span v-if="filtros.procedencia" class="tag">
          Procedência: "{{ filtros.procedencia }}" ✕
        </span>
        <span v-if="filtros.datacao" class="tag">
          Datação: "{{ filtros.datacao }}" ✕
        </span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.museu-acervo {
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
.status-bom {
  color: #28a745;
  font-weight: 600;
}
.status-regular {
  color: #ffc107;
  font-weight: 600;
}
.status-fragmentado {
  color: #fd7e14;
  font-weight: 600;
}
.status-deteriorado {
  color: #dc3545;
  font-weight: 600;
}
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
  .museu-acervo {
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
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.item-card {
  animation: fadeIn 0.3s ease-out;
}
</style>