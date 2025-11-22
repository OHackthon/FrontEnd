<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import FooterSection from '@/components/FooterSection.vue';
import HeaderNav from '@/components/HeaderNav.vue';

const mapContainer = ref(null);
const statusMessage = ref('Status: Selecione uma região ou realize uma busca.');
const selectedRegion = ref('Joinville/SC');
const mapLoaded = ref(false);

let mapInstance = null;
let markerLayer = null;
let highlightLayer = null;
const activeSambaqui = ref(null);

const SAMBAQUIS = [
    { id: 1, nome: "Sambaqui Rio Comprido", lat: -26.3110, lon: -48.8650, cidade: "Joinville/SC" },
    { id: 2, nome: "Sambaqui Cubatão", lat: -26.2500, lon: -48.7800, cidade: "Joinville/SC" },
    { id: 11, nome: "Sítio João de Laje", lat: -26.2800, lon: -48.8500, cidade: "Joinville/SC" },
    { id: 21, nome: "Sambaqui Barra do Sul", lat: -26.4700, lon: -48.6500, cidade: "Barra do Sul/SC" },
    { id: 40, nome: "Sítio Arqueológico de Itapoá", lat: -26.1100, lon: -48.6200, cidade: "Itapoá/SC" },
    { id: 41, nome: "Sambaqui Praia Grande", lat: -26.5500, lon: -48.6000, cidade: "São Francisco do Sul/SC" },
    { id: 42, nome: "Sítio Piraí", lat: -26.3300, lon: -48.9500, cidade: "Joinville/SC" },
    { id: 3, nome: "Sambaqui Garopaba", lat: -28.0200, lon: -48.6200, cidade: "Garopaba/SC" },
    { id: 9, nome: "Sambaqui Laranjeiras", lat: -27.6000, lon: -48.5100, cidade: "Florianópolis/SC" },
    { id: 22, nome: "Sambaqui Açores", lat: -27.7500, lon: -48.5000, cidade: "Florianópolis/SC" },
    { id: 23, nome: "Sambaqui Lagoa", lat: -27.6000, lon: -48.4700, cidade: "Florianópolis/SC" },
    { id: 4, nome: "Sambaqui Ponta do Caio", lat: -28.7500, lon: -48.9500, cidade: "Jaguaruna/SC" },
    { id: 24, nome: "Sambaqui Laguna", lat: -28.4700, lon: -48.7800, cidade: "Laguna/SC" },
    { id: 43, nome: "Sambaqui Canto Grande", lat: -27.2000, lon: -48.5800, cidade: "Bombinhas/SC" },
    { id: 44, nome: "Sítio Arqueológico do Mar Grosso", lat: -28.5200, lon: -48.9800, cidade: "Imbituba/SC" },
    { id: 30, nome: "Sambaqui Paranaguá", lat: -25.5000, lon: -48.5000, cidade: "Paranaguá/PR" },
    { id: 45, nome: "Sambaqui Guaratuba", lat: -25.8800, lon: -48.5600, cidade: "Guaratuba/PR" },
    { id: 46, nome: "Sambaqui Pontal do Sul", lat: -25.6800, lon: -48.3700, cidade: "Pontal do Paraná/PR" },
    { id: 31, nome: "Sambaqui Rio Grande", lat: -32.0300, lon: -52.1000, cidade: "Rio Grande/RS" },
    { id: 47, nome: "Sambaqui Torres", lat: -29.3500, lon: -49.7200, cidade: "Torres/RS" },
    { id: 48, nome: "Sambaqui Pinhal", lat: -30.3000, lon: -50.2000, cidade: "Balneário Pinhal/RS" },
    { id: 5, nome: "Sambaqui Ilha de Santo Amaro", lat: -23.9550, lon: -46.2900, cidade: "Guarujá/SP" },
    { id: 6, nome: "Sambaqui de Maratuã", lat: -23.7700, lon: -45.5400, cidade: "São Sebastião/SP" },
    { id: 13, nome: "Sambaqui Monte Carmelo", lat: -23.6500, lon: -46.5500, cidade: "São Vicente/SP" },
    { id: 14, nome: "Sambaqui Cubatão Mirim", lat: -23.9700, lon: -46.3300, cidade: "Santos/SP" },
    { id: 25, nome: "Sambaqui Peruíbe", lat: -24.3100, lon: -46.9900, cidade: "Peruíbe/SP" },
    { id: 26, nome: "Sambaqui Caraguá", lat: -23.7200, lon: -45.4200, cidade: "Caraguatatuba/SP" },
    { id: 49, nome: "Sambaqui Cananéia", lat: -25.0100, lon: -47.9200, cidade: "Cananéia/SP" },
    { id: 50, nome: "Sambaqui Ilha Comprida", lat: -24.9500, lon: -47.8500, cidade: "Ilha Comprida/SP" },
    { id: 51, nome: "Sítio Arqueológico Bertioga", lat: -23.8200, lon: -46.1300, cidade: "Bertioga/SP" },
    { id: 7, nome: "Sambaqui Saquarema", lat: -22.9500, lon: -42.4800, cidade: "Saquarema/RJ" },
    { id: 8, nome: "Sambaqui do Forte", lat: -22.8800, lon: -42.0200, cidade: "Cabo Frio/RJ" },
    { id: 15, nome: "Sambaqui Maricá", lat: -22.9200, lon: -42.8200, cidade: "Maricá/RJ" },
    { id: 27, nome: "Sambaqui Araruama", lat: -22.8600, lon: -42.3500, cidade: "Araruama/RJ" },
    { id: 28, nome: "Sambaqui Niterói", lat: -22.9000, lon: -43.1000, cidade: "Niterói/RJ" },
    { id: 52, nome: "Sambaqui Barra de São João", lat: -22.5600, lon: -41.9700, cidade: "Casimiro de Abreu/RJ" },
    { id: 53, nome: "Sambaqui Sepetiba", lat: -22.9800, lon: -43.8500, cidade: "Rio de Janeiro/RJ" },
    { id: 37, nome: "Sambaqui Vitória", lat: -20.3100, lon: -40.3000, cidade: "Vitória/ES" },
    { id: 54, nome: "Sambaqui Vila Velha", lat: -20.3500, lon: -40.3500, cidade: "Vila Velha/ES" },
    { id: 55, nome: "Sambaqui Conceição da Barra", lat: -18.5900, lon: -39.7300, cidade: "Conceição da Barra/ES" },
    { id: 16, nome: "Sambaqui de Salvador", lat: -13.0000, lon: -38.5100, cidade: "Salvador/BA" },
    { id: 17, nome: "Sambaqui Itaparica", lat: -12.8700, lon: -38.6500, cidade: "Itaparica/BA" },
    { id: 29, nome: "Sambaqui Porto Seguro", lat: -16.4400, lon: -39.0600, cidade: "Porto Seguro/BA" },
    { id: 56, nome: "Sambaqui Ilhéus", lat: -14.7900, lon: -39.0300, cidade: "Ilhéus/BA" },
    { id: 57, nome: "Sambaqui Canavieiras", lat: -15.6700, lon: -38.9300, cidade: "Canavieiras/BA" },
    { id: 33, nome: "Sambaqui Aracaju", lat: -10.9100, lon: -37.0700, cidade: "Aracaju/SE" },
    { id: 36, nome: "Sambaqui Maceió", lat: -9.6600, lon: -35.7300, cidade: "Maceió/AL" },
    { id: 32, nome: "Sambaqui Recife", lat: -8.0500, lon: -34.8800, cidade: "Recife/PE" },
    { id: 58, nome: "Sambaqui Tamandaré", lat: -8.7400, lon: -35.1000, cidade: "Tamandaré/PE" },
    { id: 18, nome: "Sambaqui Cabedelo", lat: -6.9800, lon: -34.8200, cidade: "João Pessoa/PB" },
    { id: 35, nome: "Sambaqui Natal", lat: -5.7900, lon: -35.2000, cidade: "Natal/RN" },
    { id: 34, nome: "Sambaqui Fortaleza", lat: -3.7300, lon: -38.5200, cidade: "Fortaleza/CE" },
    { id: 19, nome: "Sambaqui Fortim", lat: -4.4300, lon: -37.7700, cidade: "Fortim/CE" },
    { id: 59, nome: "Sambaqui Cumbuco", lat: -3.6100, lon: -38.7400, cidade: "Caucaia/CE" },
    { id: 60, nome: "Sambaqui Parnaíba", lat: -2.9000, lon: -41.7700, cidade: "Parnaíba/PI" },
    { id: 100, nome: "Sambaqui Total View", lat: -15.0000, lon: -45.0000, cidade: "Mostrar Todos" },
];

const CITIES_CONFIG = {
    "Joinville/SC": { coords: { lat: -26.3110, lng: -48.8650 }, zoom: 10 },
    "Barra do Sul/SC": { coords: { lat: -26.4700, lng: -48.6500 }, zoom: 10 },
    "Itapoá/SC": { coords: { lat: -26.1100, lng: -48.6200 }, zoom: 10 },
    "São Francisco do Sul/SC": { coords: { lat: -26.5500, lng: -48.6000 }, zoom: 10 },
    "Garopaba/SC": { coords: { lat: -28.0200, lng: -48.6200 }, zoom: 10 },
    "Florianópolis/SC": { coords: { lat: -27.6000, lng: -48.5100 }, zoom: 10 },
    "Jaguaruna/SC": { coords: { lat: -28.7500, lng: -48.9500 }, zoom: 10 },
    "Laguna/SC": { coords: { lat: -28.4700, lng: -48.7800 }, zoom: 10 },
    "Bombinhas/SC": { coords: { lat: -27.2000, lng: -48.5800 }, zoom: 10 },
    "Imbituba/SC": { coords: { lat: -28.5200, lng: -48.9800 }, zoom: 10 },
    "Paranaguá/PR": { coords: { lat: -25.5000, lng: -48.5000 }, zoom: 10 },
    "Guaratuba/PR": { coords: { lat: -25.8800, lng: -48.5600 }, zoom: 10 },
    "Pontal do Paraná/PR": { coords: { lat: -25.6800, lng: -48.3700 }, zoom: 10 },
    "Rio Grande/RS": { coords: { lat: -32.0300, lng: -52.1000 }, zoom: 9 },
    "Torres/RS": { coords: { lat: -29.3500, lng: -49.7200 }, zoom: 10 },
    "Balneário Pinhal/RS": { coords: { lat: -30.3000, lng: -50.2000 }, zoom: 10 },
    "Guarujá/SP": { coords: { lat: -23.9550, lng: -46.2900 }, zoom: 10 },
    "São Sebastião/SP": { coords: { lat: -23.7700, lng: -45.5400 }, zoom: 10 },
    "São Vicente/SP": { coords: { lat: -23.6500, lng: -46.5500 }, zoom: 10 },
    "Santos/SP": { coords: { lat: -23.9700, lng: -46.3300 }, zoom: 10 },
    "Peruíbe/SP": { coords: { lat: -24.3100, lng: -46.9900 }, zoom: 10 },
    "Caraguatatuba/SP": { coords: { lat: -23.7200, lng: -45.4200 }, zoom: 10 },
    "Cananéia/SP": { coords: { lat: -25.0100, lng: -47.9200 }, zoom: 10 },
    "Ilha Comprida/SP": { coords: { lat: -24.9500, lng: -47.8500 }, zoom: 10 },
    "Bertioga/SP": { coords: { lat: -23.8200, lng: -46.1300 }, zoom: 10 },
    "Saquarema/RJ": { coords: { lat: -22.9500, lng: -42.4800 }, zoom: 10 },
    "Cabo Frio/RJ": { coords: { lat: -22.8800, lng: -42.0200 }, zoom: 10 },
    "Maricá/RJ": { coords: { lat: -22.9200, lng: -42.8200 }, zoom: 10 },
    "Araruama/RJ": { coords: { lat: -22.8600, lng: -42.3500 }, zoom: 10 },
    "Niterói/RJ": { coords: { lat: -22.9000, lng: -43.1000 }, zoom: 10 },
    "Casimiro de Abreu/RJ": { coords: { lat: -22.5600, lng: -41.9700 }, zoom: 10 },
    "Rio de Janeiro/RJ": { coords: { lat: -22.9800, lng: -43.8500 }, zoom: 10 },
    "Vitória/ES": { coords: { lat: -20.3100, lng: -40.3000 }, zoom: 10 },
    "Vila Velha/ES": { coords: { lat: -20.3500, lng: -40.3500 }, zoom: 10 },
    "Conceição da Barra/ES": { coords: { lat: -18.5900, lng: -39.7300 }, zoom: 10 },
    "Salvador/BA": { coords: { lat: -13.0000, lng: -38.5100 }, zoom: 10 },
    "Itaparica/BA": { coords: { lat: -12.8700, lng: -38.6500 }, zoom: 10 },
    "Porto Seguro/BA": { coords: { lat: -16.4400, lng: -39.0600 }, zoom: 10 },
    "Ilhéus/BA": { coords: { lat: -14.7900, lng: -39.0300 }, zoom: 10 },
    "Canavieiras/BA": { coords: { lat: -15.6700, lng: -38.9300 }, zoom: 10 },
    "Aracaju/SE": { coords: { lat: -10.9100, lng: -37.0700 }, zoom: 10 },
    "Maceió/AL": { coords: { lat: -9.6600, lng: -35.7300 }, zoom: 10 },
    "Recife/PE": { coords: { lat: -8.0500, lng: -34.8800 }, zoom: 10 },
    "Tamandaré/PE": { coords: { lat: -8.7400, lng: -35.1000 }, zoom: 10 },
    "João Pessoa/PB": { coords: { lat: -6.9800, lng: -34.8200 }, zoom: 10 },
    "Natal/RN": { coords: { lat: -5.7900, lng: -35.2000 }, zoom: 10 },
    "Fortaleza/CE": { coords: { lat: -3.7300, lng: -38.5200 }, zoom: 10 },
    "Fortim/CE": { coords: { lat: -4.4300, lng: -37.7700 }, zoom: 10 },
    "Caucaia/CE": { coords: { lat: -3.6100, lng: -38.7400 }, zoom: 10 },
    "Parnaíba/PI": { coords: { lat: -2.9000, lng: -41.7700 }, zoom: 10 },
    "Mostrar Todos": { coords: { lat: -15.0000, lng: -45.0000 }, zoom: 4 }
};

const uniqueCities = computed(() => {
    const cities = [...new Set(SAMBAQUIS.map(s => s.cidade).filter(c => c !== "Mostrar Todos"))];
    cities.sort();
    return ['Mostrar Todos', ...cities];
});

const searchInput = ref('');
const searchResults = ref([]);
let searchDebounceTimeout = null;

function normalizeCoord(value) {
    const num = parseFloat(value.replace(',', '.').trim());
    return isNaN(num) ? null : num;
}

function performSearch() {
    activeSambaqui.value = null;

    if (!searchInput.value) {
        searchResults.value = [];
        return;
    }

    const term = searchInput.value.toLowerCase();
    let results = [];

    results = SAMBAQUIS.filter(s =>
        s.nome.toLowerCase().includes(term) || s.cidade.toLowerCase().includes(term)
    );

    const parts = term.split(/[\s,]+/);
    if (parts.length === 2) {
        const lat = normalizeCoord(parts[0]);
        const lon = normalizeCoord(parts[1]);

        if (lat !== null && lon !== null) {
            const coordResults = SAMBAQUIS.filter(s =>
                s.lat.toFixed(2) === lat.toFixed(2) && s.lon.toFixed(2) === lon.toFixed(2)
            );
            results = [...new Set([...coordResults, ...results])];
        }
    }

    searchResults.value = results.filter(s => s.id !== 100);

    statusMessage.value = `Status: ${searchResults.value.length} resultados encontrados.`;
}

const handleSearchInput = (event) => {
    searchInput.value = event.target.value;
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(performSearch, 300);
};

function clearMarkers() {
    if (markerLayer) markerLayer.clearLayers();
    if (highlightLayer) highlightLayer.clearLayers();
}

function displaySambaquis(sambaquis) {
    if (typeof L === 'undefined' || !mapInstance) return;

    clearMarkers();
    let bounds = [];

    sambaquis.forEach(sambaqui => {
        const popupContent = `
            <div class="font-bold text-base text-gray-800">${sambaqui.nome}</div>
            <div class="text-xs text-gray-500 mb-1">${sambaqui.cidade}</div>
            <div class="text-xs font-mono">Lat: ${sambaqui.lat.toFixed(4)}, Lon: ${sambaqui.lon.toFixed(4)}</div>
        `;

        const lat = sambaqui.lat;
        const lng = sambaqui.lon;

        const marker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'sambaqui-marker',
                html: '<div class="bg-teal-600 w-3 h-3 rounded-full border-2 border-white shadow"></div>',
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            })
        }).addTo(markerLayer);

        marker.bindPopup(popupContent);

        marker.on('click', () => {
            selectSambaquiOnMap(sambaqui);
        });

        bounds.push([lat, lng]);
    });

    if (bounds.length > 0 && selectedRegion.value === 'Mostrar Todos') {
        mapInstance.fitBounds(bounds, { padding: [20, 20] });
    }
}

function selectSambaquiOnMap(sambaqui, zoomTo = false) {
    if (typeof L === 'undefined' || !mapInstance) return;

    activeSambaqui.value = sambaqui;

    if (highlightLayer) highlightLayer.clearLayers();

    const lat = sambaqui.lat;
    const lng = sambaqui.lon;

    const highlightIcon = L.divIcon({
        className: 'sambaqui-marker-highlight',
        html: '<div class="bg-red-600 w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    L.marker([lat, lng], { icon: highlightIcon }).addTo(highlightLayer);

    if (zoomTo) {
        mapInstance.setView([lat, lng], 14);
    }
}


function centerMapOnSelectedRegion() {
    if (typeof L === 'undefined' || !mapInstance) return;

    const region = selectedRegion.value;
    const config = CITIES_CONFIG[region];
    activeSambaqui.value = null;
    searchResults.value = [];

    if (highlightLayer) highlightLayer.clearLayers();

    if (!config) return;

    mapInstance.setView([config.coords.lat, config.coords.lng], config.zoom);

    if (region === 'Mostrar Todos') {
        const allSambaquis = SAMBAQUIS.filter(s => s.id !== 100);
        displaySambaquis(allSambaquis);
        statusMessage.value = `Status: Exibindo ${allSambaquis.length} sambaquis no Brasil.`;
    } else {
        const regionSambaquis = SAMBAQUIS.filter(s => s.cidade === region);
        displaySambaquis(regionSambaquis);
        statusMessage.value = `Status: Exibindo ${regionSambaquis.length} sambaquis em ${region}.`;
    }
}

const loadLeafletScript = () => {
    if (typeof L !== 'undefined') return Promise.resolve();

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => {
            setTimeout(resolve, 50);
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

function initializeMap() {
    if (typeof L === 'undefined' || !mapContainer.value) {
        statusMessage.value = "ERRO: Biblioteca Leaflet não carregada.";
        mapLoaded.value = false;
        return;
    }

    const initialCoords = CITIES_CONFIG['Joinville/SC'].coords;

    mapInstance = L.map(mapContainer.value, {
        center: [initialCoords.lat, initialCoords.lng],
        zoom: CITIES_CONFIG['Joinville/SC'].zoom,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    markerLayer = L.layerGroup().addTo(mapInstance);
    highlightLayer = L.layerGroup().addTo(mapInstance);
    mapLoaded.value = true;

    centerMapOnSelectedRegion();

    mapInstance.invalidateSize();
}

watch(selectedRegion, (newRegion) => {
    if (newRegion) {
        centerMapOnSelectedRegion();
    }
});

onMounted(async () => {
    statusMessage.value = "Status: Carregando biblioteca de mapas...";
    try {
        await loadLeafletScript();
        initializeMap();
    } catch (error) {
        console.error("Falha ao carregar Leaflet:", error);
        statusMessage.value = "ERRO: Falha ao carregar Leaflet. Verifique sua conexão CDN.";
        mapLoaded.value = false;
    }
});

onUnmounted(() => {
    if (mapInstance) {
        mapInstance.remove();
    }
});
</script>

<template>
    <div class="flex flex-col font-sans text-gray-800">

        <main class="px-4 md:px-8 max-w-7xl mx-auto w-full mt-12 mb-0">

            <div class="max-w-7xl mx-auto">
                <h1 class="text-3xl font-bold text-gray-900 mb-8">Sambaqui Explorer Map (OpenStreetMap)</h1>
                <p class="text-gray-600 mb-6">Visualização de sítios arqueológicos por região. Total de {{
                    SAMBAQUIS.length - 1 }} sambaquis mapeados.</p>
            </div>

            <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[40vh]">

                <div class="lg:col-span-1 flex flex-col space-y-3">

                    <!-- Card de busca -->
                    <div class="bg-white p-4 rounded-xl shadow-lg border-t-4 border-gray-400 flex-1">
                        <label for="search-input" class="block text-sm font-bold text-gray-700 mb-2">Busca Avançada
                            (Nome, Cidade, Lat/Lon)</label>
                        <div class="relative">
                            <input id="search-input" type="text" :value="searchInput" @input="handleSearchInput"
                                @keyup.enter="performSearch" placeholder="Ex: Rio Comprido ou -26.31 -48.86"
                                class="w-full border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2.5 transition-all text-sm pl-4 pr-10">
                            <button @click="performSearch"
                                class="absolute right-0 top-0 mt-2.5 mr-3 text-gray-500 hover:text-teal-600">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Card de região -->
                    <div class="bg-white p-3 rounded-xl shadow-lg border-t-4 border-teal-500 flex-1">
                        <label for="region-select" class="block text-sm font-bold text-gray-700 mb-3">
                            <svg class="w-5 h-10 inline mr-1 -mt-1 text-teal-600" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Escolha a Região
                        </label>
                        <select id="region-select" v-model="selectedRegion"
                            class="w-full border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2.5 transition-all text-sm mb-4">
                            <option v-for="city in uniqueCities" :key="city" :value="city">{{ city }}</option>
                        </select>

                        <button @click="selectedRegion = 'Mostrar Todos'"
                            class="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9c-1.657 0-3 4.03-3 9s1.343 9 3 9z" />
                            </svg>
                            Ver Todos os Sítios
                        </button>
                    </div>

                    <!-- Card de resultados de busca -->
                    <div v-if="searchResults.length > 0"
                        class="bg-white p-4 rounded-xl shadow-lg border border-gray-200 flex-1 overflow-y-auto">
                        <h3 class="font-bold text-gray-900 mb-3 border-b pb-2">
                            Resultados da Busca ({{ searchResults.length }})
                        </h3>
                        <table class="min-w-full text-left text-sm divide-y divide-gray-200">
                            <thead>
                                <tr class="text-xs text-gray-500 uppercase">
                                    <th class="py-2 font-medium">Nome</th>
                                    <th class="py-2 font-medium">Cidade</th>
                                    <th class="py-2 font-medium text-center">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="sambaqui in searchResults" :key="sambaqui.id"
                                    class="hover:bg-teal-50 cursor-pointer transition-colors"
                                    @click="selectSambaquiOnMap(sambaqui, true)">
                                    <td class="py-2 font-medium text-gray-800">{{ sambaqui.nome }}</td>
                                    <td class="py-2 text-gray-600">{{ sambaqui.cidade }}</td>
                                    <td class="py-2 text-center text-teal-600 font-semibold">→</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Card de detalhes -->
                    <div class="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex-1 overflow-y-auto"
                        :class="{ 'min-h-[120px]': searchResults.length === 0 }">
                        <h3 class="font-bold text-gray-900 mb-2 border-b pb-2">
                            Detalhes do Sítio Clicado
                        </h3>
                        <div v-if="activeSambaqui" class="space-y-2 pt-2">
                            <p class="text-lg font-bold text-teal-700">{{ activeSambaqui.nome }}</p>
                            <p class="text-sm text-gray-600">
                                <span class="font-semibold">Local:</span> {{ activeSambaqui.cidade }}
                            </p>
                            <div class="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded space-y-1">
                                <p>ID do Sítio: <span class="font-bold">{{ activeSambaqui.id }}</span></p>
                                <p>Latitude: {{ activeSambaqui.lat.toFixed(6) }}</p>
                                <p>Longitude: {{ activeSambaqui.lon.toFixed(6) }}</p>
                            </div>

                            <div class="pt-2">
                                <button @click="selectSambaquiOnMap(activeSambaqui, true)"
                                    class="text-sm text-blue-600 hover:underline">
                                    Centralizar no Mapa
                                </button>
                            </div>
                        </div>
                        <div v-else class="text-gray-500 text-sm italic py-6 text-center">
                            Clique em um marcador ou use a busca para ver os detalhes.
                        </div>
                    </div>
                </div>

                <!-- Mapa -->
                <div class="lg:col-span-2 h-full relative">
                    <div ref="mapContainer" class="map-container">
                        <div v-if="!mapLoaded"
                            class="absolute inset-0 flex items-center justify-center bg-gray-200/80 rounded-xl">
                            <p class="text-gray-600 font-medium p-4 text-center">
                                {{ statusMessage }}
                                <span v-if="!statusMessage.includes('ERRO')" class="block mt-2">Carregando
                                    mapa...</span>
                                <span v-if="statusMessage.includes('ERRO')"
                                    class="text-sm text-red-500 block mt-2">Tente recarregar a página.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
/* Altura total do container principal do grid para responsividade */
/* h-[calc(100vh-185px)] COMPENSA O HEAD + PADDING PARA O LAYOUT MAIS APERTADO */
.h-\[calc\(100vh-185px\)\] {
    height: calc(100vh - 12px); 
}

/* Estilo para garantir que o mapa tenha a altura correta E ocupe a coluna */
.map-container {
    height: 100%; /* Ocupa 100% da altura definida pelo grid pai */
    width: 100%;
    border-radius: 0.75rem; 
    box-shadow: 0 5px 10px -2px rgba(0, 0, 0, 0.1);
    position: relative; 
}

/* Corrige layout no mobile onde o grid colapsa */
@media (max-width: 1023px) {
    /* No mobile, a altura é reduzida, mas o mapa ainda precisa de uma altura definida */
    .h-\[calc\(100vh-185px\)\] {
        height: auto; /* Deixa a altura flexível no mobile */
    }
    .map-container {
        height: 60vh; /* Altura fixa para o mapa no mobile */
    }
}
</style>