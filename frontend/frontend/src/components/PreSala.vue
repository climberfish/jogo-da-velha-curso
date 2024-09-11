<script setup>
import { ref } from 'vue';
import axios from 'axios';

const sala = ref('');

const emit = defineEmits(['partidaCriada']);

const props = defineProps(['usuario']);

async function criarPartida() {
    const resposta = await axios.post('http://localhost:3000/partida', {
        jogador_1: props.usuario,
    });
    emit('partidaCriada', resposta.data.id);
}

async function entrarNaSala() {
    try {
        const resposta = await axios.put(`http://localhost:3000/partida/${sala.value}`, {
            jogador_2: props.usuario,
        });
        emit('partidaCriada', resposta.data.id);
    } catch (error) {
        alert('Erro ao entrar na sala!');
    }
}
</script>

<template>
    <div class="pre-sala">
        <h2>Nome de jogador: {{ props.usuario }}</h2>
        <label>
            Número da sala:
            <input type="text" v-model="sala" placeholder="Digite o número da sala" />
        </label>
        <button @click="entrarNaSala">Entrar na sala</button>
        <button @click="criarPartida">Criar Partida</button>
    </div>
</template>

<style scoped>
.pre-sala {
    max-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.pre-sala * {
    width: 100%;
}
</style>