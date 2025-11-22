<script setup>
import { ref, computed, onMounted } from 'vue';
import { useLocationStore } from '@/stores/locationStore';
import SideBar from '@/components/SideBar.vue';
import NavBar from '@/components/NavBar.vue';

const store = useLocationStore();
const showModal = ref(false);
const isEditing = ref(false);
const searchQuery = ref('');
const submitting = ref(false);

// Estado do Formulário
const form = ref({
    id: null,
    nome_local: '',
    tipo_ambiente: 'Reserva',
    capacidade_estimada: null
});

// Opções de Tipo (Poderia vir do backend)
const tiposAmbiente = ['Reserva', 'Exposição', 'Laboratório', 'Administrativo', 'Externo'];

onMounted(() => {
    store.fetchLocations();
});

// Filtro
const filteredLocations = computed(() => {
    if (!searchQuery.value) return store.sortedLocations;
    const lower = searchQuery.value.toLowerCase();
    return store.sortedLocations.filter(l => 
        l.nome_local.toLowerCase().includes(lower) || 
        l.tipo_ambiente.toLowerCase().includes(lower)
    );
});

// Ações
const openCreateModal = () => {
    isEditing.value = false;
    form.value = { id: null, nome_local: '', tipo_ambiente: 'Reserva', capacidade_estimada: null };
    showModal.value = true;
};

const openEditModal = (location) => {
    isEditing.value = true;
    form.value = { ...location };
    showModal.value = true;
};

const handleSubmit = async () => {
    submitting.value = true;
    try {
        if (isEditing.value) {
            await store.updateLocation(form.value.id, form.value);
        } else {
            await store.createLocation(form.value);
        }
        showModal.value = false;
    } catch (e) {
        alert('Erro ao salvar: ' + e.message);
    } finally {
        submitting.value = false;
    }
};

const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja remover este local? Isso pode afetar o histórico.')) {
        await store.deleteLocation(id);
    }
};
</script>

<template>
    <div class="flex min-h-screen bg-gray-50 font-sans">
        <SideBar />
        <div class="flex-1 flex flex-col md:ml-64">
            <NavBar />
            
            <main class="p-8 max-w-6xl mx-auto w-full">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800">Localizações Físicas</h1>
                        <p class="text-sm text-gray-500">Gerencie salas, reservas e locais externos</p>
                    </div>
                    <button @click="openCreateModal" class="btn-primary">
                        + Nova Localização
                    </button>
                </div>

                <!-- Filtro -->
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <input v-model="searchQuery" type="text" placeholder="Buscar local..." class="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                </div>

                <!-- Tabela -->
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidade</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-if="store.loading" v-for="n in 3" :key="n" class="animate-pulse">
                                <td colspan="4" class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-full"></div></td>
                            </tr>
                            <tr v-else v-for="loc in filteredLocations" :key="loc.id" class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ loc.nome_local }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {{ loc.tipo_ambiente }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-gray-500">{{ loc.capacidade_estimada || '-' }} itens</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button @click="openEditModal(loc)" class="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                                    <button @click="handleDelete(loc.id)" class="text-red-600 hover:text-red-900">Excluir</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Editar' : 'Nova' }} Localização</h3>
                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Nome do Local</label>
                        <input v-model="form.nome_local" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Tipo de Ambiente</label>
                        <select v-model="form.tipo_ambiente" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option v-for="tipo in tiposAmbiente" :key="tipo" :value="tipo">{{ tipo }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Capacidade Estimada</label>
                        <input v-model="form.capacidade_estimada" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    </div>
                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" @click="showModal = false" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                        <button type="submit" :disabled="submitting" class="btn-primary">
                            {{ submitting ? 'Salvando...' : 'Salvar' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.btn-primary {
    @apply bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800 transition-colors font-medium shadow-sm;
}
</style>