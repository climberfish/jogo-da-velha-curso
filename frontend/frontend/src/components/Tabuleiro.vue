<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

const props = defineProps(['sala', 'usuario']);

const partida = ref(null);

const tabuleiro = computed(() => {
  return partida.value?.tabuleiro || [];
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function atualizarPartida() {
  const resposta = await axios.get(`${API_URL}/partida/${props.sala}`);
  partida.value = resposta.data;
}
setInterval(atualizarPartida, 300);

async function jogar(linha, coluna) {
  if (tabuleiro.value[linha][coluna] !== '') return;

  await axios.post(`${API_URL}/partida/${props.sala}/jogada`, {
    jogador: props.usuario,
    coordenadas: [linha, coluna],
  });
}
</script>

<template>
    <p>Número da sala: {{ props.sala }}</p>
    <p>Jogador: {{ props.usuario }}</p>
    <p v-if="!partida?.jogador_2">Aguardando outro jogador...</p>
    <div v-else>
      <p>Jogando contra: {{ props.usuario === partida.jogador_1 ? partida.jogador_2 : partida.jogador_1 }}</p>
      <p v-if="partida.status === 'EM_ANDAMENTO'">
        Jogador da vez: {{ partida.jogador_atual }}
      </p>
      <p v-else-if="partida.status === 'FINALIZADA'">
        Ganhador: {{ partida.vencedor || 'EMPATE' }}
      </p>
    </div>
    <div class="tabuleiro">
        <div
            class="linha"
            v-for="(linha, indexLinha) in tabuleiro"
            :key="indexLinha"
        >
        <div
          v-for="(coluna, indexColuna) in linha"
          :key="indexColuna"
          :class="{
            celula: true,
            'celula-vermelha': tabuleiro[indexLinha][indexColuna] === 'X',
          }"
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
  font-size: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: darkblue;
  background-color: #ffe6e6;
}
.tabuleiro > .linha > .celula-vermelha {
  color: darkred;
}
</style>