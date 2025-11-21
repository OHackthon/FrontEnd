<script setup>
import { ref, reactive } from 'vue';

// --- Estado do Formulário ---
const formData = reactive({
    acervoNumber: '',    // Número do Acervo
    name: '',            // Título / Nome
    collection: '',      // Coleção
    material: '',        // Matéria-prima
    subtype: '',         // Sub-tipo
    provenance: '',      // Procedência / Origem
    dating: '',          // Datação (Opcional)
    location: '',        // Localização Física
    description: '',     // Descrição
    notes: ''            // Observações
});
const materialOptions = ['Animal', 'Vegetal', 'Mineral', 'Outro'];


// --- Estado de UI e Validação ---
const errors = reactive({});
const isDragging = ref(false);
const isSaving = ref(false);
const showSuccessMessage = ref(false);
const fileInput = ref(null);

// Lista de imagens carregadas
const images = ref([]);

// --- Métodos de Validação ---
const validateForm = () => {
    // Limpa erros anteriores
    Object.keys(errors).forEach(key => delete errors[key]);
    let isValid = true;

    // Validação dos campos obrigatórios
    const requiredFields = {
        acervoNumber: 'O número do acervo é obrigatório.',
        name: 'O título/nome é obrigatório.',
        collection: 'A coleção é obrigatória.',
        material: 'A matéria-prima é obrigatória.',
        subtype: 'O sub-tipo é obrigatório.',
        provenance: 'A procedência/origem é obrigatória.',
        location: 'A localização física é obrigatória.',
        description: 'A descrição é obrigatória.',
        notes: 'O campo de observações é obrigatório.'
    };

    for (const [field, message] of Object.entries(requiredFields)) {
        if (!formData[field] || !formData[field].trim()) {
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
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];

    Array.from(fileList).forEach(file => {
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
                size: (file.size / 1024).toFixed(2) + ' KB',
                preview: e.target.result
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

// --- Submissão ---
const handleSubmit = async () => {
    if (!validateForm()) {
        // Scroll suave para o topo em caso de erro
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    isSaving.value = true;

    // Simula delay de processamento
    setTimeout(() => {
        // Preparar payload para log
        const payload = {
            dadosFormulario: { ...formData },
            imagens: images.value.map(img => ({
                nome: img.name,
                tipo: img.type,
                tamanho: img.size,
                previewBase64: img.preview // Base64 completo para log
            }))
        };

        console.log('=== CADASTRO DE ARTEFATO REALIZADO ===');
        console.log(JSON.parse(JSON.stringify(payload))); // Deep clone para evitar Proxy no log

        isSaving.value = false;
        showSuccessMessage.value = true;

        setTimeout(() => {
            showSuccessMessage.value = false;
        }, 3000);
    }, 1000);
};

const handleCancel = () => {
    if (confirm('Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.')) {
        Object.keys(formData).forEach(key => formData[key] = '');
        images.value = [];
        Object.keys(errors).forEach(key => delete errors[key]);
    }
};
</script>

<template>
    <div class="min-h-screen bg-[#F8F5F1] font-sans text-[#1C1C1C]">

        

        <!-- ================= CONTEÚDO PRINCIPAL ================= -->
        <main class="mx-auto w-full max-w-7xl flex-grow px-4 py-8 md:px-8">

            <!-- Toast de Sucesso -->
            <transition enter-active-class="transition ease-out duration-300"
                enter-from-class="transform opacity-0 translate-y-2"
                enter-to-class="transform opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <div v-if="showSuccessMessage"
                    class="fixed right-6 top-24 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Artefato salvo! Verifique o console.</span>
                </div>
            </transition>

            <h1 class="mb-8 text-3xl font-bold tracking-tight text-[#1C1C1C] md:text-4xl">Registrar Novo Artefato</h1>

            <form @submit.prevent="handleSubmit" class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">

                <!-- === COLUNA ESQUERDA: DADOS DO ACERVO === -->
                <div class="space-y-8 lg:col-span-7">

                    <!-- Grupo 1: Identificação Básica -->
                    <section>
                        <h2 class="mb-4 text-lg font-bold text-[#1C1C1C] border-b border-gray-200 pb-2">Identificação
                            Básica</h2>

                        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <!-- Número do Acervo -->
                            <div>
                                <label class="mb-1.5 block text-sm font-medium text-gray-700">Número do Acervo <span
                                        class="text-red-500">*</span></label>
                                <input type="text" v-model="formData.acervoNumber" placeholder="ex.: A-2024-001"
                                    :class="{ 'border-red-500 ring-1 ring-red-500': errors.acervoNumber }"
                                    class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]">
                                <span v-if="errors.acervoNumber" class="mt-1 text-xs text-red-500">{{
                                    errors.acervoNumber }}</span>
                            </div>

                            <!-- Título / Nome -->
                            <div>
                                <label class="mb-1.5 block text-sm font-medium text-gray-700">Título / Nome <span
                                        class="text-red-500">*</span></label>
                                <input type="text" v-model="formData.name" placeholder="ex.: Vaso Cerimonial"
                                    :class="{ 'border-red-500 ring-1 ring-red-500': errors.name }"
                                    class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]">
                                <span v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</span>
                            </div>
                        </div>

                        <div class="mt-5">
                            <!-- Coleção -->
                            <label class="mb-1.5 block text-sm font-medium text-gray-700">Coleção <span
                                    class="text-red-500">*</span></label>
                            <input type="text" v-model="formData.collection" placeholder="ex.: Arqueologia Pré-Colonial"
                                :class="{ 'border-red-500 ring-1 ring-red-500': errors.collection }"
                                class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]">
                            <span v-if="errors.collection" class="mt-1 text-xs text-red-500">{{ errors.collection
                                }}</span>
                        </div>
                    </section>

                    <!-- Grupo 2: Características Físicas e Origem -->
                    <section>
                        <h2 class="mb-4 text-lg font-bold text-[#1C1C1C] border-b border-gray-200 pb-2">Características
                            & Origem</h2>

                        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <!-- Matéria-prima -->
                           <div>
    <label class="mb-1.5 block text-sm font-medium text-gray-700">
        Matéria-prima <span class="text-red-500">*</span>
    </label>

    <div class="relative">
        <select
            v-model="formData.material"
            :class="{ 'border-red-500 ring-1 ring-red-500': errors.material }"
            class="w-full cursor-pointer appearance-none rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"
        >
            <option value="" disabled>Selecione...</option>
            <option v-for="opt in materialOptions" :key="opt" :value="opt">
                {{ opt }}
            </option>
        </select>

        <!-- Ícone do select -->
        <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6" />
            </svg>
        </div>
    </div>

    <span v-if="errors.material" class="mt-1 text-xs text-red-500">
        {{ errors.material }}
    </span>
</div>


                            <!-- Sub-tipo -->
                            <div>
                                <label class="mb-1.5 block text-sm font-medium text-gray-700">Sub-tipo <span
                                        class="text-red-500">*</span></label>
                                <input type="text" v-model="formData.subtype"
                                    placeholder="ex.: Cerâmica, Osso..."
                                    :class="{ 'border-red-500 ring-1 ring-red-500': errors.subtype }"
                                    class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]">
                                <span v-if="errors.subtype" class="mt-1 text-xs text-red-500">{{ errors.subtype
                                    }}</span>
                            </div>

                            <!-- Procedência / Origem -->
                            <div>
                                <label class="mb-1.5 block text-sm font-medium text-gray-700">Procedência / Origem <span
                                        class="text-red-500">*</span></label>
                                <input type="text" v-model="formData.provenance" placeholder="ex.: Escavação Site A"
                                    :class="{ 'border-red-500 ring-1 ring-red-500': errors.provenance }"
                                    class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]">
                                <span v-if="errors.provenance" class="mt-1 text-xs text-red-500">{{ errors.provenance
                                    }}</span>
                            </div>

                            <!-- Datação (Opcional) -->
                            <div>
                                <label class="mb-1.5 block text-sm font-medium text-gray-700">Datação <span
                                        class="text-gray-400 font-normal">(Se houver)</span></label>
                                <input type="text" v-model="formData.dating" placeholder="ex.: Século XVIII, 1000 a.C."
                                    class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]">
                            </div>
                        </div>

                        <!-- Localização Física -->
                        <div class="mt-5">
                            <label class="mb-1.5 block text-sm font-medium text-gray-700">Localização Física <span
                                    class="text-red-500">*</span></label>
                            <input type="text" v-model="formData.location"
                                placeholder="ex.: Reserva Técnica, Estante B, Prateleira 3"
                                :class="{ 'border-red-500 ring-1 ring-red-500': errors.location }"
                                class="w-full rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]">
                            <span v-if="errors.location" class="mt-1 text-xs text-red-500">{{ errors.location }}</span>
                        </div>
                    </section>

                    <!-- Grupo 3: Descritivo -->
                    <section>
                        <h2 class="mb-4 text-lg font-bold text-[#1C1C1C] border-b border-gray-200 pb-2">Detalhes &
                            Observações</h2>

                        <div class="space-y-5">
                            <!-- Descrição -->
                            <div>
                                <label class="mb-1.5 block text-sm font-medium text-gray-700">Descrição <span
                                        class="text-red-500">*</span></label>
                                <textarea v-model="formData.description" rows="4"
                                    placeholder="Descrição detalhada do artefato..."
                                    :class="{ 'border-red-500 ring-1 ring-red-500': errors.description }"
                                    class="w-full resize-none rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"></textarea>
                                <span v-if="errors.description" class="mt-1 text-xs text-red-500">{{ errors.description
                                    }}</span>
                            </div>

                            <!-- Observações -->
                            <div>
                                <label class="mb-1.5 block text-sm font-medium text-gray-700">Observações <span
                                        class="text-red-500">*</span></label>
                                <textarea v-model="formData.notes" rows="3"
                                    placeholder="Estado de conservação, restauros anteriores, etc..."
                                    :class="{ 'border-red-500 ring-1 ring-red-500': errors.notes }"
                                    class="w-full resize-none rounded-md border border-transparent bg-[#F2EFE9] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3D3E]"></textarea>
                                <span v-if="errors.notes" class="mt-1 text-xs text-red-500">{{ errors.notes }}</span>
                            </div>
                        </div>
                    </section>

                </div>

                <!-- === COLUNA DIREITA: UPLOAD & IMAGENS === -->
                <div class="space-y-8 lg:col-span-5">

                    <section>
                        <h2 class="mb-4 text-lg font-bold text-[#1C1C1C]">Imagens do Artefato</h2>

                        <!-- Área de Upload (Dropzone) -->
                        <div @click="triggerFileInput" @dragenter.prevent="isDragging = true"
                            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
                            @drop.prevent="handleDrop" :class="[
                                'flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 text-center transition-all duration-200',
                                isDragging
                                    ? 'border-dashed border-[#0F3D3E] bg-[#EBEBE6]'
                                    : 'border-dashed border-[#C4C4C4] bg-[#EFEDE8] hover:bg-[#E5E2DC]'
                            ]">
                            <div class="mb-4 rounded bg-[#8C8C8C] p-2 text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" x2="12" y1="3" y2="15" />
                                </svg>
                            </div>
                            <p class="text-base font-medium text-[#1C1C1C]">Clique para enviar <span
                                    class="font-normal text-gray-500">ou arraste e solte</span></p>
                            <p class="mt-2 text-xs text-gray-500">Formatos suportados: SVG, PNG, JPG ou GIF</p>

                            <!-- Input File Oculto -->
                            <input type="file" ref="fileInput" class="hidden" @change="handleFileSelect" multiple
                                accept="image/png, image/jpeg, image/gif, image/svg+xml">
                        </div>

                        <!-- Seção Arquivos Enviados -->
                        <div v-if="images.length > 0" class="mt-8">
                            <h3 class="mb-3 text-sm font-bold text-[#1C1C1C]">Arquivos Enviados ({{ images.length }})
                            </h3>

                            <transition-group name="list" tag="div" class="grid grid-cols-2 gap-4">
                                <div v-for="(img, index) in images" :key="img.id"
                                    class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition hover:shadow-md">
                                    <!-- Preview Imagem -->
                                    <img :src="img.preview" :alt="img.name"
                                        class="h-full w-full object-contain rounded">

                                    <!-- Overlay Hover -->
                                    <div class="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5">
                                    </div>

                                    <!-- Botão Remover (X) -->
                                    <button type="button" @click.stop="removeImage(index)"
                                        class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-all duration-200 hover:scale-110 hover:bg-red-600 group-hover:opacity-100"
                                        aria-label="Remover imagem">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M18 6 6 18" />
                                            <path d="m6 6 12 12" />
                                        </svg>
                                    </button>

                                    <!-- Info Tamanho -->
                                    <span
                                        class="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                                        {{ img.size }}
                                    </span>
                                </div>
                            </transition-group>
                        </div>
                    </section>

                </div>

                <!-- === RODAPÉ DE AÇÕES === -->
                <div class="flex flex-col justify-end gap-4 border-t border-[#E5E0D8] pt-8 sm:flex-row lg:col-span-12">
                    <button type="button" @click="handleCancel"
                        class="rounded-md border border-red-500 px-8 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 md:text-base">
                        Cancelar
                    </button>
                    <button type="submit" :disabled="isSaving"
                        class="flex items-center justify-center gap-2 rounded-md bg-[#0F3D3E] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0A2A2B] disabled:cursor-not-allowed disabled:opacity-70 md:text-base">
                        <svg v-if="isSaving" class="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        {{ isSaving ? 'Salvando...' : 'Salvar Artefato' }}
                    </button>
                </div>

            </form>
        </main>
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