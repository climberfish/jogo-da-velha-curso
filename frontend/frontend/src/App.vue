<script setup>
import Tabuleiro from './components/Tabuleiro.vue';
import Login from './components/Login.vue';
import PreSala from './components/PreSala.vue';
import { ref } from 'vue';
import axios from 'axios';

const usuario = ref('');
const sala = ref();

function definirUsuario(usuarioLogado) {
    usuario.value = usuarioLogado;
}
function partidaCriada(id) {
  sala.value = id;
}
</script>

<template>
  <header>
    <h1>Jogo da Velha - Curso de desenvolvimento web com Node.js, Express, Vue.js e PostgreSQL</h1>
  </header>

  <main>
    <Login v-if="!usuario" @login="definirUsuario" />
    <div v-else>
      <PreSala v-if="!sala" @partidaCriada="partidaCriada" :usuario="usuario" />
      <Tabuleiro v-else :sala="sala" :usuario="usuario" />
    </div>
  </main>
</template>
