<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

const props = defineProps(['sala', 'usuario']);

const partida = ref(null);

const tabuleiro = computed(() => {
  return partida.value?.tabuleiro || [];
});

async function atualizarPartida() {
  const resposta = await axios.get(`http://localhost:3000/partida/${props.sala}`);
  partida.value = resposta.data;
}
setInterval(atualizarPartida, 300);

function jogar(linha, coluna) {
  tabuleiro.value[linha][coluna] = 'X';
}
</script>

<template>
    <p>Número da sala: {{ props.sala }}</p>
    <p>Jogador: {{ props.usuario }}</p>
    <p v-if="!partida?.jogador_2">Aguardando outro jogador...</p>
    <p v-else>Jogando contra: {{ props.usuario === partida.jogador_1 ? partida.jogador_2 : partida.jogador_1 }}</p>
    <div class="tabuleiro">
        <div
            class="linha"
            v-for="(linha, indexLinha) in tabuleiro"
            :key="indexLinha"
        >
            <div
                class="celula"
                v-for="(coluna, indexColuna) in linha"
                :key="indexColuna"
                @click="jogar(indexLinha, indexColuna)"
            >
                {{ tabuleiro[indexLinha][indexColuna] }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.tabuleiro {
  display: flex;
  flex-direction: column;
  background-color: #fac4c4;
  border-radius: 8px;
  padding: 16px;
  gap: 8px;
}
.tabuleiro > .linha {
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.tabuleiro > .linha > .celula {
  width: 30%;
  height: 40px;
  border: 1px solid #363636;
}
</style>