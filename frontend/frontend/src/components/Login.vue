<script setup>
import { ref } from 'vue';

const usuario = ref('');

const emit = defineEmits(['login']);

function login() {
    emit('login', usuario.value);
}
</script>

<template>
    <h2>Escolha um nome de usuário</h2>
    <input type="text" v-model="usuario" />
    <button @click="login">Entrar</button>
</template>