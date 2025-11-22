<script setup>
import { ref, reactive, onMounted } from "vue";
import { useColecoesStore } from "@/stores/colecoes";
import { useCategoriasStore } from "@/stores/categorias";
import { useMateriasPrimasStore } from "@/stores/materiasPrimas";
import { useItensAcervoStore } from "@/stores/itensAcervo";
import { useLoading } from "@/stores/loading";

// Stores
const colecoesStore = useColecoesStore();
const categoriasStore = useCategoriasStore();
const materiasPrimasStore = useMateriasPrimasStore();
const itensAcervoStore = useItensAcervoStore();
const loadingStore = useLoading();

// Estado para armazenar o primeiro acervo disponível
const acervoId = ref(null);

// --- Estado do Formulário ---
const formData = reactive({
  nome: "", // Título / Nome
  colecao: null, // FK para coleção
  materia_prima: null, // FK para matéria-prima
  subtipo: "", // Campo de texto para subtipo
  localizacao_atual: "", // Campo de texto para localização atual
  categoria_acervo: null, // FK para categoria
  procedencia: "", // Procedência / Origem
  datacao: "", // Datação (Opcional)
  estado_conservacao: "", // Estado de conservação
  dimensoes: "", // Dimensões
  peso_g: null, // Peso em gramas
  descricao: "", // Descrição
  inteireza: "", // Inteireza
  observacoes_curadoria: "", // Observações
});

// Opções estáticas
const estadoConservacaoOptions = [
  { value: "BOM", label: "Bom" },
  { value: "REGULAR", label: "Regular" },
  { value: "FRAGMENTADO", label: "Fragmentado" },
];

const inteirezaOptions = [
  { value: "INTEIRO", label: "Inteiro" },
  { value: "PARCIAL", label: "Parcial" },
  { value: "FRAGMENTADO", label: "Fragmentado" },
];

// Carregamento inicial dos dados
onMounted(async () => {
  loadingStore.isLoading = true;
  try {
    await Promise.all([
      colecoesStore.fetchColecoes(),
      // Removido localizacoesStore e subtiposStore pois agora são campos de texto
      categoriasStore.fetchCategorias(),
      materiasPrimasStore.fetchMateriasPrimas(),
    ]);

    // Buscar o primeiro acervo disponível
    try {
      const response = await fetch("http://127.0.0.1:8000/api/acervos/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = await response.json();
      const acervos = Array.isArray(data) ? data : data.results || [];

      if (acervos.length > 0) {
        acervoId.value = acervos[0].id;
        console.log("Acervo selecionado - ID:", acervoId.value);
      } else {
        console.warn("Nenhum acervo encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar acervos:", error);
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  } finally {
    loadingStore.isLoading = false;
  }
});

// Modal para adicionar categoria
const showAddCategoriaModal = ref(false);
const newCategoria = reactive({
  nome: "",
  descricao: "",
});

// Modal para adicionar coleção
const showAddColecaoModal = ref(false);
const newColecao = reactive({
  nome_colecao: "",
  descricao: "",
});

// Refs/estado adicionais usados no template e nas funções
const isSaving = ref(false);
const errors = reactive({});
const images = ref([]);
const fileInput = ref(null);
const isDragging = ref(false);

// --- Métodos de Validação ---
const validateForm = () => {
  // Limpa erros anteriores
  Object.keys(errors).forEach((key) => delete errors[key]);
  let isValid = true;

  // Validação dos campos obrigatórios
  const requiredFields = {
    nome: "O título/nome é obrigatório.",
    colecao: "A coleção é obrigatória.",
    materia_prima: "A matéria-prima é obrigatória.",
    subtipo: "O sub-tipo é obrigatório.",
    procedencia: "A procedência/origem é obrigatória.",
    localizacao_atual: "A localização física é obrigatória.",
    categoria_acervo: "A categoria do acervo é obrigatória.",
    estado_conservacao: "O estado de conservação é obrigatório.",
    inteireza: "A inteireza é obrigatória.",
    descricao: "A descrição é obrigatória.",
    observacoes_curadoria: "O campo de observações é obrigatório.",
  };

  for (const [field, message] of Object.entries(requiredFields)) {
    if (
      !formData[field] ||
      (typeof formData[field] === "string" && !formData[field].trim())
    ) {
      errors[field] = message;
      isValid = false;
    }
  }

  return isValid;
};

// --- Métodos de Upload de Imagem ---
const triggerFileInput = () => {
  fileInput.value.click();
};

const processFiles = (fileList) => {
  const MAX_SIZE_MB = 5;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];

  Array.from(fileList).forEach((file) => {
    // Validação de Tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`O arquivo "${file.name}" não é suportado. Use apenas SVG, PNG, JPG ou GIF.`);
      return;
    }

    // Validação de Tamanho
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`O arquivo "${file.name}" excede o limite de ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Leitura e Criação de Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      images.value.push({
        id: Date.now() + Math.random(),
        fileObject: file,
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(2) + " KB",
        preview: e.target.result,
      });
    };
    reader.readAsDataURL(file);
  });
};

const handleFileSelect = (event) => {
  if (event.target.files) {
    processFiles(event.target.files);
    event.target.value = null;
  }
};

const handleDrop = (event) => {
  isDragging.value = false;
  if (event.dataTransfer.files) {
    processFiles(event.dataTransfer.files);
  }
};

const removeImage = (index) => {
  images.value.splice(index, 1);
  if (fileInput.value) {
    fileInput.value.value = null;
  }
};

const handleSubmit = async () => {
  // Validação local do formulário
  if (!validateForm()) {
    return;
  }

  if (!acervoId.value) {
    console.error("Erro: Nenhum acervo disponível.");
    return;
  }

  isSaving.value = true;

  try {
    // Monta payload a partir do formData e do acervo selecionado
    const payload = {
      ...formData,
      acervo: parseInt(acervoId.value), // Garantindo que seja um número
    };

    console.log("=== CADASTRO DE ARTEFATO REALIZADO ===");
    console.log("Dados do formulário:", payload);
    console.log("acervoId.value:", acervoId.value);
    console.log("Imagens:", images.value);

    // Chama a store/api para salvar
    await itensAcervoStore.createItemAcervo(payload);

    // Limpar o formulário após salvamento
    resetForm();
  } catch (error) {
    console.error("Erro ao salvar artefato:", error);
  } finally {
    isSaving.value = false;
  }
};

// Resetar formulário
const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    if (typeof formData[key] === "string") {
      formData[key] = "";
    } else {
      formData[key] = null;
    }
  });
  images.value = [];
  Object.keys(errors).forEach((key) => delete errors[key]);
};

// Função para criar nova categoria
const handleAddCategoria = async () => {
  if (!newCategoria.nome.trim()) {
    alert("O nome da categoria é obrigatório");
    return;
  }

  try {
    const success = await categoriasStore.createCategoria({
      nome: newCategoria.nome.trim(),
      descricao: newCategoria.descricao.trim() || "",
    });

    if (success) {
      // Recarregar as categorias para atualizar o dropdown
      await categoriasStore.fetchCategorias();

      // Encontrar a categoria recém-criada e selecioná-la automaticamente
      const novaCategoria = categoriasStore.categorias.find(
        (cat) => cat.nome.toLowerCase() === newCategoria.nome.toLowerCase().trim()
      );

      if (novaCategoria) {
        formData.categoria_acervo = novaCategoria.id;
      }

      // Limpar o formulário do modal
      newCategoria.nome = "";
      newCategoria.descricao = "";
      showAddCategoriaModal.value = false;
    }
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
  }
};

// Função para criar nova coleção
const handleAddColecao = async () => {
  if (!newColecao.nome_colecao.trim()) {
    alert("O nome da coleção é obrigatório");
    return;
  }

  try {
    const success = await colecoesStore.createColecao({
      nome_colecao: newColecao.nome_colecao.trim(),
      descricao: newColecao.descricao.trim() || null,
    });

    if (success) {
      // Recarregar as coleções para atualizar o dropdown
      await colecoesStore.fetchColecoes();

      // Encontrar a coleção recém-criada e selecioná-la automaticamente
      const novaColecao = colecoesStore.colecoes.find(
        (col) =>
          col.nome_colecao.toLowerCase() === newColecao.nome_colecao.toLowerCase().trim()
      );

      if (novaColecao) {
        formData.colecao = novaColecao.id;
      }

      // Limpar o formulário do modal
      newColecao.nome_colecao = "";
      newColecao.descricao = "";
      showAddColecaoModal.value = false;
    }
  } catch (error) {
    console.error("Erro ao criar coleção:", error);
  }
};

const handleCancel = () => {
  if (
    confirm("Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.")
  ) {
    resetForm();
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#F8F5F1] font-sans text-[#1C1C1C]">
    <!-- ================= CONTEÚDO PRINCIPAL ================= -->
    <main class="mx-auto w-full max-w-7xl grow px-4 py-8 md:px-8">
      <h1 class="mb-8 text-3xl font-bold tracking-tight text-[#1C1C1C] md:text-4xl">
        Registrar Novo Artefato
      </h1>

      <form
        @submit.prevent="handleSubmit"
        class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12"
      >
        <!-- === COLUNA ESQUERDA: DADOS DO ACERVO === -->
        <div class="space-y-8 lg:col-span-7">
          <!-- Grupo 1: Identificação Básica -->
          <section>
            <h2
              class="mb-4 text-lg font-bold text-[#1C1C1C] border-b border-gray-200 pb-2"
            >
              Identificação Básica
            </h2>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <!-- Categoria do Acervo -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Categoria do Acervo <span class="text-red-500">*</span></label
                >
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <select
                      v-model="formData.categoria_acervo"
                      :class="{
                        'border-red-500 ring-1 ring-red-500': errors.categoria_acervo,
                      }"
                      class="w-full cursor-pointer appearance-none rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                    >
                      <option value="" disabled>Selecione...</option>
                      <option
                        v-for="categoria in categoriasStore.categorias"
                        :key="categoria.id"
                        :value="categoria.id"
                      >
                        {{ categoria.nome }}
                      </option>
                    </select>
                    <div
                      class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="showAddCategoriaModal = true"
                    class="flex h-12 w-12 items-center justify-center rounded-md bg-[#0F3D3E] text-white transition hover:bg-[#0A2A2B] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:ring-offset-2"
                    title="Adicionar nova categoria"
                  >
                    <svg
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
                <span v-if="errors.categoria_acervo" class="mt-1 text-xs text-red-500">{{
                  errors.categoria_acervo
                }}</span>
              </div>

              <!-- Título / Nome -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Título / Nome <span class="text-red-500">*</span></label
                >
                <input
                  type="text"
                  v-model="formData.nome"
                  placeholder="ex.: Vaso Cerimonial"
                  :class="{ 'border-red-500 ring-1 ring-red-500': errors.nome }"
                  class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                />
                <span v-if="errors.nome" class="mt-1 text-xs text-red-500">{{
                  errors.nome
                }}</span>
              </div>
            </div>

            <div class="mt-5">
              <!-- Coleção -->
              <label class="mb-1.5 block text-sm font-medium text-gray-700"
                >Coleção <span class="text-red-500">*</span></label
              >
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <select
                    v-model="formData.colecao"
                    :class="{ 'border-red-500 ring-1 ring-red-500': errors.colecao }"
                    class="w-full cursor-pointer appearance-none rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                  >
                    <option value="" disabled>Selecione uma coleção...</option>
                    <option
                      v-for="colecao in colecoesStore.colecoes"
                      :key="colecao.id"
                      :value="colecao.id"
                    >
                      {{ colecao.nome_colecao }}
                    </option>
                  </select>
                  <div
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  @click="showAddColecaoModal = true"
                  class="flex h-12 w-12 items-center justify-center rounded-md bg-[#0F3D3E] text-white transition hover:bg-[#0A2A2B] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:ring-offset-2"
                  title="Adicionar nova coleção"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
              <span v-if="errors.colecao" class="mt-1 text-xs text-red-500">{{
                errors.colecao
              }}</span>
            </div>
          </section>

          <!-- Grupo 2: Características Físicas e Origem -->
          <section>
            <h2
              class="mb-4 text-lg font-bold text-[#1C1C1C] border-b border-gray-200 pb-2"
            >
              Características & Origem
            </h2>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <!-- Matéria-prima -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">
                  Matéria-prima <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model="formData.materia_prima"
                    :class="{
                      'border-red-500 ring-1 ring-red-500': errors.materia_prima,
                    }"
                    class="w-full cursor-pointer appearance-none rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                  >
                    <option value="" disabled>Selecione...</option>
                    <option
                      v-for="materia in materiasPrimasStore.materiasPrimas"
                      :key="materia.value || materia.id"
                      :value="materia.value || materia.id"
                    >
                      {{ materia.label || materia.nome }}
                    </option>
                  </select>
                  <div
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
                <span v-if="errors.materia_prima" class="mt-1 text-xs text-red-500">{{
                  errors.materia_prima
                }}</span>
              </div>

              <!-- Sub-tipo -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Sub-tipo <span class="text-red-500">*</span></label
                >
                <input
                  type="text"
                  v-model="formData.subtipo"
                  placeholder="ex.: Cerâmica utilitária, Lâmina polida, etc."
                  :class="{ 'border-red-500 ring-1 ring-red-500': errors.subtipo }"
                  class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                />
                <span v-if="errors.subtipo" class="mt-1 text-xs text-red-500">{{
                  errors.subtipo
                }}</span>
              </div>

              <!-- Procedência / Origem -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Procedência / Origem <span class="text-red-500">*</span></label
                >
                <input
                  type="text"
                  v-model="formData.procedencia"
                  placeholder="ex.: Escavação Site A"
                  :class="{ 'border-red-500 ring-1 ring-red-500': errors.procedencia }"
                  class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                />
                <span v-if="errors.procedencia" class="mt-1 text-xs text-red-500">{{
                  errors.procedencia
                }}</span>
              </div>

              <!-- Datação (Opcional) -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Datação
                  <span class="text-gray-400 font-normal">(Se houver)</span></label
                >
                <input
                  type="text"
                  v-model="formData.datacao"
                  placeholder="ex.: Século XVIII, 1000 a.C."
                  class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                />
              </div>

              <!-- Estado de Conservação -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Estado de Conservação <span class="text-red-500">*</span></label
                >
                <div class="relative">
                  <select
                    v-model="formData.estado_conservacao"
                    :class="{
                      'border-red-500 ring-1 ring-red-500': errors.estado_conservacao,
                    }"
                    class="w-full cursor-pointer appearance-none rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                  >
                    <option value="" disabled>Selecione...</option>
                    <option
                      v-for="estado in estadoConservacaoOptions"
                      :key="estado.value"
                      :value="estado.value"
                    >
                      {{ estado.label }}
                    </option>
                  </select>
                  <div
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
                <span
                  v-if="errors.estado_conservacao"
                  class="mt-1 text-xs text-red-500"
                  >{{ errors.estado_conservacao }}</span
                >
              </div>

              <!-- Inteireza -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Inteireza <span class="text-red-500">*</span></label
                >
                <div class="relative">
                  <select
                    v-model="formData.inteireza"
                    :class="{ 'border-red-500 ring-1 ring-red-500': errors.inteireza }"
                    class="w-full cursor-pointer appearance-none rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                  >
                    <option value="" disabled>Selecione...</option>
                    <option
                      v-for="inteireza in inteirezaOptions"
                      :key="inteireza.value"
                      :value="inteireza.value"
                    >
                      {{ inteireza.label }}
                    </option>
                  </select>
                  <div
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
                <span v-if="errors.inteireza" class="mt-1 text-xs text-red-500">{{
                  errors.inteireza
                }}</span>
              </div>
            </div>

            <!-- Localização Física -->
            <div class="mt-5">
              <label class="mb-1.5 block text-sm font-medium text-gray-700"
                >Localização Física <span class="text-red-500">*</span></label
              >
              <input
                type="text"
                v-model="formData.localizacao_atual"
                placeholder="ex.: Reserva Técnica A - Estante 01, Sala de Exposição, etc."
                :class="{
                  'border-red-500 ring-1 ring-red-500': errors.localizacao_atual,
                }"
                class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
              />
              <span v-if="errors.localizacao_atual" class="mt-1 text-xs text-red-500">{{
                errors.localizacao_atual
              }}</span>
            </div>

            <!-- Dimensões e Peso -->
            <div class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <!-- Dimensões -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Dimensões</label
                >
                <input
                  type="text"
                  v-model="formData.dimensoes"
                  placeholder="ex.: 15cm x 10cm x 8cm"
                  class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                />
              </div>

              <!-- Peso -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Peso (gramas)</label
                >
                <input
                  type="number"
                  v-model="formData.peso_g"
                  placeholder="ex.: 250"
                  class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                />
              </div>
            </div>
          </section>

          <!-- Grupo 3: Descritivo -->
          <section>
            <h2
              class="mb-4 text-lg font-bold text-[#1C1C1C] border-b border-gray-200 pb-2"
            >
              Detalhes & Observações
            </h2>

            <div class="space-y-5">
              <!-- Descrição -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Descrição <span class="text-red-500">*</span></label
                >
                <textarea
                  v-model="formData.descricao"
                  rows="4"
                  placeholder="Descrição detalhada do artefato..."
                  :class="{ 'border-red-500 ring-1 ring-red-500': errors.descricao }"
                  class="w-full resize-none rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                ></textarea>
                <span v-if="errors.descricao" class="mt-1 text-xs text-red-500">{{
                  errors.descricao
                }}</span>
              </div>

              <!-- Observações de Curadoria -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Observações de Curadoria <span class="text-red-500">*</span></label
                >
                <textarea
                  v-model="formData.observacoes_curadoria"
                  rows="3"
                  placeholder="Estado de conservação, restauros anteriores, etc..."
                  :class="{
                    'border-red-500 ring-1 ring-red-500': errors.observacoes_curadoria,
                  }"
                  class="w-full resize-none rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
                ></textarea>
                <span
                  v-if="errors.observacoes_curadoria"
                  class="mt-1 text-xs text-red-500"
                  >{{ errors.observacoes_curadoria }}</span
                >
              </div>
            </div>
          </section>
        </div>

        <!-- === COLUNA DIREITA: UPLOAD & IMAGENS === -->
        <div class="space-y-8 lg:col-span-5">
          <section>
            <h2 class="mb-4 text-lg font-bold text-[#1C1C1C]">Imagens do Artefato</h2>

            <!-- Área de Upload (Dropzone) -->
            <div
              @click="triggerFileInput"
              @dragenter.prevent="isDragging = true"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              :class="[
                'flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 text-center transition-all duration-200',
                isDragging
                  ? 'border-dashed border-[#0F3D3E] bg-[#EBEBE6]'
                  : 'border-dashed border-[#C4C4C4] bg-[#EFEDE8] hover:bg-[#E5E2DC]',
              ]"
            >
              <div class="mb-4 rounded bg-[#8C8C8C] p-2 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              </div>
              <p class="text-base font-medium text-[#1C1C1C]">
                Clique para enviar
                <span class="font-normal text-gray-500">ou arraste e solte</span>
              </p>
              <p class="mt-2 text-xs text-gray-500">
                Formatos suportados: SVG, PNG, JPG ou GIF
              </p>

              <!-- Input File Oculto -->
              <input
                type="file"
                ref="fileInput"
                class="hidden"
                @change="handleFileSelect"
                multiple
                accept="image/png, image/jpeg, image/gif, image/svg+xml"
              />
            </div>

            <!-- Seção Arquivos Enviados -->
            <div v-if="images.length > 0" class="mt-8">
              <h3 class="mb-3 text-sm font-bold text-[#1C1C1C]">
                Arquivos Enviados ({{ images.length }})
              </h3>

              <transition-group name="list" tag="div" class="grid grid-cols-2 gap-4">
                <div
                  v-for="(img, index) in images"
                  :key="img.id"
                  class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition hover:shadow-md"
                >
                  <!-- Preview Imagem -->
                  <img
                    :src="img.preview"
                    :alt="img.name"
                    class="h-full w-full object-contain rounded"
                  />

                  <!-- Overlay Hover -->
                  <div
                    class="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5"
                  ></div>

                  <!-- Botão Remover (X) -->
                  <button
                    type="button"
                    @click.stop="removeImage(index)"
                    class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-all duration-200 hover:scale-110 hover:bg-red-600 group-hover:opacity-100"
                    aria-label="Remover imagem"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>

                  <!-- Info Tamanho -->
                  <span
                    class="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100"
                  >
                    {{ img.size }}
                  </span>
                </div>
              </transition-group>
            </div>
          </section>
        </div>

        <!-- === RODAPÉ DE AÇÕES === -->
        <div
          class="flex flex-col justify-end gap-4 border-t border-[#E5E0D8] pt-8 sm:flex-row lg:col-span-12"
        >
          <button
            type="button"
            @click="handleCancel"
            class="rounded-md border border-red-500 px-8 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 md:text-base"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSaving"
            class="flex items-center justify-center gap-2 rounded-md bg-[#0F3D3E] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0A2A2B] disabled:cursor-not-allowed disabled:opacity-70 md:text-base"
          >
            <svg
              v-if="isSaving"
              class="h-4 w-4 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isSaving ? "Salvando..." : "Salvar Artefato" }}
          </button>
        </div>
      </form>
    </main>

    <!-- Modal para Adicionar Nova Categoria -->
    <div
      v-if="showAddCategoriaModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div class="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-gray-900">
            Nova Categoria do Acervo
          </h3>

          <form @submit.prevent="handleAddCategoria" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Nome da Categoria *</label
              >
              <input
                v-model="newCategoria.nome"
                type="text"
                placeholder="Ex: Arqueológico, Histórico..."
                class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20"
                required
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Descrição</label
              >
              <textarea
                v-model="newCategoria.descricao"
                rows="3"
                placeholder="Descreva brevemente esta categoria..."
                class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20 resize-none"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="
                  showAddCategoriaModal = false;
                  newCategoria.nome = '';
                  newCategoria.descricao = '';
                "
                class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="!newCategoria.nome.trim() || loadingStore.isLoading"
                class="rounded-md bg-[#0F3D3E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0A2A2B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Criar Categoria
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal para Adicionar Nova Coleção -->
    <div
      v-if="showAddColecaoModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div class="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-gray-900">Nova Coleção</h3>

          <form @submit.prevent="handleAddColecao" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Nome da Coleção *</label
              >
              <input
                v-model="newColecao.nome_colecao"
                type="text"
                placeholder="Ex: Coleção Arqueológica, Coleção Etnográfica..."
                class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20"
                required
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Descrição</label
              >
              <textarea
                v-model="newColecao.descricao"
                rows="3"
                placeholder="Descreva brevemente esta coleção..."
                class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20 resize-none"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="
                  showAddColecaoModal = false;
                  newColecao.nome_colecao = '';
                  newColecao.descricao = '';
                "
                class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="!newColecao.nome_colecao.trim() || loadingStore.isLoading"
                class="rounded-md bg-[#0F3D3E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0A2A2B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Criar Coleção
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
