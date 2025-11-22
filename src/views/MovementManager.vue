<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useMovementStore } from '@/stores/movementStore';
import { useLocationStore } from '@/stores/locationStore';
import { useAcervoStore } from '@/stores/acervo';
import SideBar from '@/components/SideBar.vue';
import NavBar from '@/components/NavBar.vue';

const movStore = useMovementStore();
const locStore = useLocationStore();
const acervoStore = useAcervoStore();

// --- CONFIGURAÇÃO E CONSTANTES ---
const INITIAL_FORM = { item: null, local_origem_id: '', local_destino_id: '', tipo_movimento: 'INTERNO', motivo: '', previsao_retorno: '' };
const STATUS_MAP = {
    DEVOLVIDO: { label: 'Devolvido', class: 'bg-green-100 text-green-800 border-green-200' },
    INTERNO: { label: 'Interno', class: 'bg-gray-100 text-gray-700 border-gray-200' },
    ATRASADO: { label: 'Atrasado', class: 'bg-red-50 text-red-700 border-red-200' },
    ATIVO: { label: 'Empréstimo Ativo', class: 'bg-amber-50 text-amber-700 border-amber-200' }
};

// --- ESTADO REATIVO UNIFICADO ---
const state = reactive({
    modal: null, // 'create' | 'return' | 'detail'
    submitting: false,
    filters: { search: '', tipo: '', status: '' },
    form: { ...INITIAL_FORM },
    returnDate: new Date().toISOString().split('T')[0],
    toast: { show: false, msg: '', type: 'success' }
});

const selectedMov = ref(null);
const itemSearch = ref('');
const showResults = ref(false);
let debounceTimer = null;

onMounted(() => Promise.all([movStore.fetchMovements(), locStore.fetchLocations()]));

// --- COMPUTEDS OTIMIZADOS ---
const list = computed(() => {
    let data = movStore.movements;
    const { search, tipo, status } = state.filters;
    const today = new Date();

    if (search) {
        const s = search.toLowerCase();
        data = data.filter(m => m.item.titulo.toLowerCase().includes(s) || m.item.numero_acervo.includes(s));
    }
    if (tipo) data = data.filter(m => m.tipo_movimento === tipo);
    if (status) {
        data = data.filter(m => {
            if (status === 'CONCLUIDO') return !!m.data_retorno_efetivo;
            const isLate = new Date(m.previsao_retorno) < today;
            return m.tipo_movimento === 'SAIDA_EXTERNA' && !m.data_retorno_efetivo && (status === 'ATRASADO' ? isLate : !isLate);
        });
    }
    return data;
});

const filteredItems = computed(() => {
    if (itemSearch.value.length < 2) return [];
    const s = itemSearch.value.toLowerCase();
    return acervoStore.itens.filter(i => i.titulo.toLowerCase().includes(s) || i.numero_acervo.includes(s)).slice(0, 6);
});

// --- ACTIONS & UTILS ---
const notify = (msg, type = 'success') => {
    state.toast = { show: true, msg, type };
    setTimeout(() => state.toast.show = false, 3000);
};

const openModal = (type, mov = null) => {
    state.modal = type;
    selectedMov.value = mov;
    if (type === 'create') {
        Object.assign(state.form, INITIAL_FORM);
        itemSearch.value = '';
    } else if (type === 'return') {
        state.returnDate = new Date().toISOString().split('T')[0];
    }
};

const selectItem = (item) => {
    state.form.item = item;
    itemSearch.value = `${item.numero_acervo} - ${item.titulo}`;
    showResults.value = false;
    // Auto-detectar origem
    const origem = locStore.locations.find(l => l.nome_local === item.localizacao_atual);
    state.form.local_origem_id = origem ? origem.id : '';
};

const submitCreate = async () => {
    const { form } = state;
    if (!form.item || !form.local_destino_id || (form.tipo_movimento === 'SAIDA_EXTERNA' && !form.previsao_retorno)) {
        return notify('Preencha os campos obrigatórios.', 'error');
    }
    if (form.local_origem_id === form.local_destino_id) return notify('Origem e destino iguais.', 'error');

    state.submitting = true;
    try {
        await movStore.createMovement({
            ...form,
            local_origem: locStore.getLocationById(form.local_origem_id),
            local_destino: locStore.getLocationById(form.local_destino_id),
            previsao_retorno: form.tipo_movimento === 'INTERNO' ? null : form.previsao_retorno
        });
        notify('Movimentação criada!');
        state.modal = null;
    } catch (e) { notify('Erro ao criar.', 'error'); } 
    finally { state.submitting = false; }
};

const submitReturn = async () => {
    state.submitting = true;
    try {
        await movStore.registerReturn(selectedMov.value.id, { data_retorno_efetivo: state.returnDate });
        notify('Devolução registrada!');
        state.modal = null;
    } catch { notify('Erro ao devolver.', 'error'); } 
    finally { state.submitting = false; }
};

// Helpers de UI
const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
const getStatus = (m) => {
    if (m.data_retorno_efetivo) return STATUS_MAP.DEVOLVIDO;
    if (m.tipo_movimento === 'INTERNO') return STATUS_MAP.INTERNO;
    return new Date(m.previsao_retorno) < new Date() ? STATUS_MAP.ATRASADO : STATUS_MAP.ATIVO;
};
const handleSearch = (e) => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => state.filters.search = e.target.value, 300); };
</script>

<template>
    <div class="flex min-h-screen bg-gray-50 font-sans text-gray-800">
        <Teleport to="body">
            <div v-if="state.toast.show" class="fixed top-5 right-5 z-[60] px-4 py-3 rounded shadow-lg bg-white border-l-4" :class="state.toast.type === 'error' ? 'border-red-500' : 'border-green-500'">
                <p class="text-sm font-medium">{{ state.toast.msg }}</p>
            </div>
        </Teleport>

        <SideBar />
        <div class="flex-1 flex flex-col md:ml-64 transition-all duration-300">
            <NavBar />
            <main class="p-6 max-w-7xl mx-auto w-full">
                <!-- Header -->
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold text-gray-900">Movimentações</h1>
                    <button @click="openModal('create')" class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-50 transition-all shadow-sm flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Nova
                    </button>
                </div>

                <!-- Filtros -->
                <div class="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-wrap gap-4">
                    <input @input="handleSearch" type="text" placeholder="Buscar..." class="border rounded px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all">
                    <select v-model="state.filters.tipo" class="border rounded px-3 py-2 text-sm w-40 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"><option value="">Todos Tipos</option><option value="INTERNO">Interno</option><option value="SAIDA_EXTERNA">Externo</option></select>
                    <select v-model="state.filters.status" class="border rounded px-3 py-2 text-sm w-40 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"><option value="">Todos Status</option><option value="ABERTO">Aberto</option><option value="ATRASADO">Atrasado</option><option value="CONCLUIDO">Concluído</option></select>
                </div>

                <!-- Tabela -->
                <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">Data</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">Item</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">Fluxo</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-if="!list.length" class="text-center"><td colspan="5" class="p-8 text-gray-500">Sem registros.</td></tr>
                            <tr v-for="m in list" :key="m.id" class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4 text-sm">{{ formatDate(m.data_movimentacao) }}</td>
                                <td class="px-6 py-4"><div class="font-medium text-sm">{{ m.item.titulo }}</div><div class="text-xs text-gray-500">#{{ m.item.numero_acervo }}</div></td>
                                <td class="px-6 py-4 text-sm flex items-center gap-2">
                                    <span class="px-2 py-0.5 rounded text-xs font-medium inline-block bg-gray-100">{{ m.local_origem.nome_local }}</span> → <span class="px-2 py-0.5 rounded text-xs font-medium inline-block bg-white border">{{ m.local_destino.nome_local }}</span>
                                </td>
                                <td class="px-6 py-4"><span :class="['px-2 py-0.5 rounded text-xs font-medium inline-block border', getStatus(m).class]">{{ getStatus(m).label }}</span></td>
                                <td class="px-6 py-4 text-right space-x-2">
                                    <button v-if="m.tipo_movimento === 'SAIDA_EXTERNA' && !m.data_retorno_efetivo" @click="openModal('return', m)" class="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-200 hover:bg-teal-100 transition-colors">Receber</button>
                                    <button @click="openModal('detail', m)" class="text-gray-400 hover:text-blue-600 transition-colors">👁️</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>

        <!-- MODAL ÚNICO -->
        <Teleport to="body">
            <div v-if="state.modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="state.modal = null">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                    <div class="px-6 py-4 border-b bg-gray-50 flex justify-between">
                        <h3 class="font-bold text-lg">{{ state.modal === 'create' ? 'Nova Movimentação' : state.modal === 'return' ? 'Registrar Devolução' : 'Detalhes' }}</h3>
                        <button @click="state.modal = null" class="text-gray-400 hover:text-black">✕</button>
                    </div>
                    
                    <div class="p-6 space-y-4">
                        <!-- CONTEÚDO CREATE -->
                        <div v-if="state.modal === 'create'" class="space-y-4">
                            <div class="relative">
                                <label class="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Item</label>
                                <input type="text" v-model="itemSearch" @focus="showResults = true" @blur="setTimeout(() => showResults = false, 200)" class="border rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" placeholder="Buscar...">
                                <ul v-if="showResults && filteredItems.length" class="absolute z-20 w-full bg-white border shadow-xl mt-1 max-h-48 overflow-auto rounded">
                                    <li v-for="i in filteredItems" :key="i.id" @mousedown.prevent="selectItem(i)" class="p-2 hover:bg-teal-50 cursor-pointer text-sm border-b">{{ i.titulo }} <span class="text-xs text-gray-500">#{{ i.numero_acervo }}</span></li>
                                </ul>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div><label class="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Origem</label><select v-model="state.form.local_origem_id" disabled class="border rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-gray-100"><option v-for="l in locStore.locations" :key="l.id" :value="l.id">{{ l.nome_local }}</option></select></div>
                                <div><label class="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Destino</label><select v-model="state.form.local_destino_id" class="border rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"><option v-for="l in locStore.locations" :key="l.id" :value="l.id" :disabled="l.id === state.form.local_origem_id">{{ l.nome_local }}</option></select></div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div><label class="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Tipo</label><select v-model="state.form.tipo_movimento" class="border rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"><option value="INTERNO">Interno</option><option value="SAIDA_EXTERNA">Externo</option></select></div>
                                <div><label class="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Retorno</label><input type="date" v-model="state.form.previsao_retorno" :disabled="state.form.tipo_movimento === 'INTERNO'" class="border rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all disabled:bg-gray-100"></div>
                            </div>
                            <textarea v-model="state.form.motivo" rows="2" class="border rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" placeholder="Motivo..."></textarea>
                        </div>

                        <!-- CONTEÚDO RETURN -->
                        <div v-if="state.modal === 'return'">
                            <p class="text-sm text-gray-600 mb-4">Item: <strong>{{ selectedMov?.item.titulo }}</strong></p>
                            <label class="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Data Efetiva</label>
                            <input type="date" v-model="state.returnDate" class="border rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all">
                        </div>

                        <!-- CONTEÚDO DETAIL -->
                        <div v-if="state.modal === 'detail'" class="text-sm space-y-2">
                            <div class="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded">
                                <div><span class="block text-xs text-gray-500">Item</span><b>{{ selectedMov.item.titulo }}</b></div>
                                <div><span class="block text-xs text-gray-500">Acervo</span>#{{ selectedMov.item.numero_acervo }}</div>
                            </div>
                            <p><strong>De:</strong> {{ selectedMov.local_origem.nome_local }} <strong>Para:</strong> {{ selectedMov.local_destino.nome_local }}</p>
                            <p><strong>Motivo:</strong> {{ selectedMov.motivo || '-' }}</p>
                            <p v-if="selectedMov.data_retorno_efetivo" class="text-green-600 font-bold">Devolvido em {{ formatDate(selectedMov.data_retorno_efetivo) }}</p>
                        </div>
                    </div>

                    <div v-if="state.modal !== 'detail'" class="px-6 py-4 bg-gray-50 flex justify-end gap-2">
                        <button @click="state.modal = null" class="bg-white border px-4 py-2 rounded hover:bg-gray-50 text-gray-700 transition-all">Cancelar</button>
                        <button @click="state.modal === 'create' ? submitCreate() : submitReturn()" :disabled="state.submitting" class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-50 transition-all shadow-sm">
                            {{ state.submitting ? 'Salvo...' : 'Confirmar' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
@keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-scale-in { animation: scale-in 0.15s ease-out; }
</style>