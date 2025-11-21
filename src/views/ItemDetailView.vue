<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAcervoStore } from '../stores/acervo';
import { jsPDF } from "jspdf";
import AcervoCard from '../components/AcervoCard.vue';
import FooterSection from '@/components/FooterSection.vue';
import HeaderNav from '@/components/HeaderNav.vue';


const route = useRoute();
const router = useRouter();
const store = useAcervoStore();

const item = ref(null);
const relatedColecao = ref([]);
const relatedMateria = ref([]);
const loading = ref(true);

const imagemAtivaIndex = ref(0);
const isZoomed = ref(false);

const activeTab = ref('colecao');
const scrollContainer = ref(null);

const shuffleArray = (array) => {
  return array.sort(() => 0.5 - Math.random());
};

const carregarItem = async () => {
  loading.value = true;
  isZoomed.value = false;
  const id = route.params.id;

  if (store.itens.length === 0) {
    await store.fetchItens();
  }

  const itemEncontrado = store.getItemPorId(id);

  if (itemEncontrado) {
    item.value = {
      ...itemEncontrado,
      dimensoes_detalhadas: itemEncontrado.dimensoes || "Alt: 28cm; Larg: 22cm; Prof: 15cm",
      peso: "1.2 kg",
      tecnica: "Modelagem manual com queima a céu aberto (oxidante)",
      aquisicao_modo: "Doação",
      aquisicao_data: "15/03/1965",
      aquisicao_origem: "Excursão de campo - Sítio A",
      proprietario: "Prefeitura Municipal de Joinville",
      instituicao: "Museu Arqueológico de Sambaqui",
      bibliografia: "TIBURTIUS, Guilherme. 'Notas sobre a cerâmica'. Arquivos do Museu, 1960."
    };

    let imgBase = itemEncontrado.img || 'https://wallpapers.com/images/featured-full/bart-simpson-menino-triste-b4vj9t4dwkc9hk4t.jpg';
    item.value.imagens = [imgBase, imgBase, imgBase];
    imagemAtivaIndex.value = 0;

    let porColecao = store.itensCompletos.filter(i => i.colecao === item.value.colecao && i.id != item.value.id);
    porColecao = [...porColecao, ...porColecao, ...porColecao];
    relatedColecao.value = shuffleArray(porColecao);

    let porMateria = store.itensCompletos.filter(i => i.materia === item.value.materia && i.id != item.value.id);
    porMateria = [...porMateria, ...porMateria, ...porMateria];
    relatedMateria.value = shuffleArray(porMateria);

  } else {
    console.error("Item não encontrado");
  }

  loading.value = false;
};

const voltarParaCategoria = () => {
  if (item.value && item.value.colecao) {
    router.push({
      name: 'acervototal',
      query: { colecao: item.value.colecao }
    });
  } else {
    router.push({ name: 'acervototal' });
  }
};

const gerarFichaPDF = async () => {
  if (!item.value) return;

  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Museu Sambaqui de Joinville", 105, y, null, null, "center");

  y += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Ficha Técnica de Acervo", 105, y, null, null, "center");

  y += 10;
  doc.setLineWidth(0.5);
  doc.line(margin, y, 190, y);
  y += 15;

  if (item.value.imagens && item.value.imagens.length > 0) {
    try {
      const getBase64ImageFromURL = (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = url;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          };
          img.onerror = (error) => {
            console.warn("Erro ao converter imagem", error);
            resolve(null);
          };
        });
      };

      const imgData = await getBase64ImageFromURL(item.value.imagens[imagemAtivaIndex.value]);

      if (imgData) {
        const imgWidth = 80;
        const imgHeight = 60;
        const xPos = (210 - imgWidth) / 2;

        doc.addImage(imgData, 'JPEG', xPos, y, imgWidth, imgHeight, undefined, 'FAST');
        y += imgHeight + 15;
      }
    } catch (e) {
      console.log("Erro imagem PDF", e);
    }
  }

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(item.value.titulo, 170);
  doc.text(titleLines, margin, y);

  y += (titleLines.length * 7) + 5;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Nº Inventário: ${item.value.numero_acervo}`, margin, y);
  doc.setTextColor(0);
  y += 10;

  const addLine = (label, value) => {
    if (!value) return;
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);

    doc.setFont("helvetica", "normal");
    const valueClean = String(value).replace(/undefined/g, "");
    const valueLines = doc.splitTextToSize(valueClean, 130);
    doc.text(valueLines, margin + 40, y);

    y += (valueLines.length * 6) + 2;

    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  };

  addLine("Coleção", item.value.colecao);
  addLine("Material", item.value.materia);
  addLine("Sub-tipo", item.value.subtipo);
  addLine("Técnica", item.value.tecnica);
  addLine("Dimensões", item.value.dimensoes_detalhadas);
  addLine("Datação", item.value.datacao);
  addLine("Procedência", item.value.procedencia);
  addLine("Estado", item.value.estado_conservacao);
  addLine("Localização", item.value.localizacao);

  y += 5;
  doc.line(margin, y, 190, y);
  y += 10;

  if (item.value.descricao) {
    doc.setFont("helvetica", "bold");
    doc.text("Descrição / Análise:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(item.value.descricao, 170);
    doc.text(descLines, margin, y);
  }

  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Gerado em ${new Date().toLocaleDateString()} - Sistema de Gestão Museológica`, margin, pageHeight - 10);

  doc.save(`Ficha_${item.value.numero_acervo}.pdf`);
};

const imagemAtiva = computed(() => {
  if (!item.value || !item.value.imagens) return '';
  return item.value.imagens[imagemAtivaIndex.value];
});

const mudarImagem = (index) => {
  imagemAtivaIndex.value = index;
  isZoomed.value = false;
};

const proximaImagem = () => {
  if (!item.value.imagens) return;
  if (imagemAtivaIndex.value < item.value.imagens.length - 1) {
    imagemAtivaIndex.value++;
  } else {
    imagemAtivaIndex.value = 0;
  }
  isZoomed.value = false;
};

const anteriorImagem = () => {
  if (!item.value.imagens) return;
  if (imagemAtivaIndex.value > 0) {
    imagemAtivaIndex.value--;
  } else {
    imagemAtivaIndex.value = item.value.imagens.length - 1;
  }
  isZoomed.value = false;
};

const toggleZoom = () => {
  isZoomed.value = !isZoomed.value;
};

const currentRelatedItems = computed(() => {
  return activeTab.value === 'colecao' ? relatedColecao.value : relatedMateria.value;
});

const scrollCarrossel = (direction) => {
  if (scrollContainer.value) {
    const containerWidth = scrollContainer.value.offsetWidth;
    const cardWidth = window.innerWidth < 768 ? containerWidth : 300;

    scrollContainer.value.scrollBy({
      left: direction * cardWidth,
      behavior: 'smooth'
    });
  }
};

watch(() => route.params.id, () => {
  carregarItem();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

onMounted(() => {
  carregarItem();
});

const corEstado = computed(() => {
  if (!item.value?.estado_conservacao) return 'bg-gray-300';
  const st = item.value.estado_conservacao.toLowerCase();
  if (st.includes('bom') || st.includes('excelente')) return 'bg-green-500';
  if (st.includes('regular')) return 'bg-yellow-500';
  return 'bg-red-500';
});
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 pb-20">

    <HeaderNav />

    <!-- LOADING -->
    <div v-if="loading" class="flex flex-col justify-center items-center h-[80vh]">
      <div class="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-gray-400 text-xs uppercase tracking-widest animate-pulse">Carregando Detalhes...</p>
    </div>

    <!-- ERRO -->
    <div v-else-if="!item" class="flex flex-col justify-center items-center h-[60vh]">
      <h2 class="text-2xl font-serif font-bold text-gray-900 mb-2">Registro não encontrado</h2>
      <button @click="router.push('/acervototal')" class="text-sm text-gray-500 hover:text-black underline">Voltar ao
        Acervo</button>
    </div>

    <!-- FICHA TÉCNICA -->
    <div v-else class="max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 sm:pt-8 animate-fade-in">

      <!-- Breadcrumb (Desktop) -->
      <nav class="hidden sm:flex mb-8 items-center justify-between border-b border-gray-100 pb-4">
        <!-- CORREÇÃO: Botão agora chama voltarParaCategoria -->
        <button @click="voltarParaCategoria"
          class="text-sm text-gray-500 hover:text-black flex items-center gap-2 transition-colors group uppercase tracking-wider font-bold">
          <span class="transform group-hover:-translate-x-1 transition-transform">←</span>
          Voltar para {{ item.colecao }}
        </button>
        <div class="text-right">
          <p class="text-[10px] text-gray-400 uppercase tracking-widest">Número de Inventário</p>
          <p class="font-mono text-sm font-bold bg-gray-100 px-2 py-1 inline-block rounded mt-1">{{ item.numero_acervo
            }}</p>
        </div>
      </nav>

      <!-- Botão Voltar (Mobile) -->
      <div class="sm:hidden mb-4">
        <!-- CORREÇÃO: Botão agora chama voltarParaCategoria -->
        <button @click="voltarParaCategoria" class="text-gray-500 flex items-center gap-1 text-sm font-medium">
          ← Voltar
        </button>
      </div>

      <!-- GRID PRINCIPAL -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-24 mb-24">

        <!-- COLUNA ESQUERDA: GALERIA -->
        <div class="lg:col-span-7">
          <div class="lg:sticky lg:top-24">

            <!-- IMAGEM -->
            <div
              class="relative w-full bg-gray-50 rounded-sm border border-gray-100 mb-4 flex items-center justify-center group overflow-hidden p-8"
              style="aspect-ratio: 4/3;" :class="isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'" @click="toggleZoom">
              <img :src="imagemAtiva" :alt="item.titulo"
                class="w-full h-full object-contain transition-transform duration-500 ease-out mix-blend-multiply select-none"
                :class="isZoomed ? 'scale-[2]' : 'scale-100'" />
              <!-- Navegação Imagem -->
              <button @click.stop="anteriorImagem" v-if="item.imagens.length > 1"
                class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 text-black">←</button>
              <button @click.stop="proximaImagem" v-if="item.imagens.length > 1"
                class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 text-black">→</button>
              <div class="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-sm pointer-events-none z-10">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" stroke-linecap="round"
                    stroke-linejoin="round" stroke-width="2" />
                </svg>
              </div>
            </div>

            <!-- MINIATURAS -->
            <div v-if="item.imagens.length > 1"
              class="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center lg:justify-start">
              <button v-for="(img, idx) in item.imagens" :key="idx" @click="mudarImagem(idx)"
                class="w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-sm overflow-hidden transition-all shrink-0 relative bg-gray-50"
                :class="imagemAtivaIndex === idx ? 'border-black opacity-100 ring-1 ring-black' : 'border-transparent opacity-60 hover:opacity-100'">
                <img :src="img" class="w-full h-full object-cover" />
              </button>
            </div>
            <p class="text-[10px] text-gray-400 mt-2 text-center lg:text-left">© Museu Sambaqui de Joinville / Foto:
              Documentação Técnica</p>
          </div>
        </div>

        <!-- COLUNA DIREITA: DADOS -->
        <div class="lg:col-span-5 flex flex-col gap-8 sm:gap-12">

          <header>
            <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span class="px-2 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-sm">{{
                item.colecao }}</span>
              <span
                class="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-200 px-2 py-1 rounded-sm">{{
                item.materia }}</span>
            </div>
            <h1 class="font-serif text-3xl sm:text-4xl md:text-5xl text-gray-900 leading-tight mb-4 sm:mb-6">{{
              item.titulo }}</h1>

            <!-- BOTÃO DE PDF -->
            <div class="flex gap-3">
              <button @click="gerarFichaPDF"
                class="w-full py-4 border border-black bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Baixar Ficha Técnica (PDF)
              </button>
            </div>
          </header>

          <!-- TABELAS DE DADOS -->
          <section>
            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
              Características</h3>
            <dl class="grid grid-cols-1 gap-y-3 sm:gap-y-4 text-sm">
              <div class="grid grid-cols-3">
                <dt class="text-gray-500 font-medium">Denominação</dt>
                <dd class="col-span-2 text-gray-900 font-serif italic">{{ item.subtipo }}</dd>
              </div>
              <div class="grid grid-cols-3">
                <dt class="text-gray-500 font-medium">Técnica</dt>
                <dd class="col-span-2 text-gray-900">{{ item.tecnica }}</dd>
              </div>
              <div class="grid grid-cols-3">
                <dt class="text-gray-500 font-medium">Dimensões</dt>
                <dd class="col-span-2 text-gray-900">{{ item.dimensoes_detalhadas }}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
              Histórico & Local</h3>
            <dl class="grid grid-cols-1 gap-y-3 sm:gap-y-4 text-sm">
              <div class="grid grid-cols-3">
                <dt class="text-gray-500 font-medium">Datação</dt>
                <dd class="col-span-2 text-gray-900">{{ item.datacao }}</dd>
              </div>
              <div class="grid grid-cols-3">
                <dt class="text-gray-500 font-medium">Procedência</dt>
                <dd class="col-span-2 text-gray-900">{{ item.procedencia }}</dd>
              </div>
            </dl>
            <div class="mt-4 bg-gray-50 p-4 rounded text-sm flex justify-between items-center">
              <span class="text-gray-500">Local Atual</span>
              <span class="font-mono font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-100">{{
                item.localizacao }}</span>
            </div>
          </section>

          <section v-if="item.descricao">
            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
              Análise</h3>
            <div class="prose prose-sm prose-gray max-w-none text-justify">
              <p>{{ item.descricao }}</p>
            </div>
          </section>
        </div>
      </div>

      <!-- SEÇÃO RELACIONADOS -->
      <section v-if="currentRelatedItems.length > 0" class="border-t border-gray-200 pt-12 sm:pt-16 mb-16">
        <div class="text-center mb-8 sm:mb-10">
          <h2 class="font-serif text-xl sm:text-3xl font-bold text-gray-900 mb-2">Explorar Relacionados</h2>
          <div class="inline-flex bg-gray-100 p-1 rounded-full mt-4">
            <button @click="activeTab = 'colecao'"
              class="px-4 sm:px-6 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full transition-all"
              :class="activeTab === 'colecao' ? 'bg-white text-black shadow-sm' : 'text-gray-500'">Coleção</button>
            <button @click="activeTab = 'materia'"
              class="px-4 sm:px-6 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full transition-all"
              :class="activeTab === 'materia' ? 'bg-white text-black shadow-sm' : 'text-gray-500'">Material</button>
          </div>
        </div>
        <div class="relative max-w-[1400px] mx-auto sm:px-12 group/arrows">
          <button @click="scrollCarrossel(-1)"
            class="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 z-10 items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:bg-black hover:text-white transition-all active:scale-95">&larr;</button>
          <div ref="scrollContainer"
            class="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 pt-2 px-4 sm:px-0 scroll-smooth">
            <div v-for="(relItem, i) in currentRelatedItems" :key="i"
              class="shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start">
              <AcervoCard :item="relItem"
                class="h-full shadow-sm hover:shadow-md transition-shadow border border-gray-100 rounded-sm" />
            </div>
          </div>
          <button @click="scrollCarrossel(1)"
            class="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 z-10 items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:bg-black hover:text-white transition-all active:scale-95">&rarr;</button>
        </div>
      </section>

    </div>
  </div>

    <FooterSection />

</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>