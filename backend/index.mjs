import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import knex from 'knex';
import knexfile from './knexfile.js';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

const bancoDeDados = knex(knexfile.development);

const tabuleiroBase = [
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];

app.post('/partida', async (req, res) => {
  const resposta = await bancoDeDados('partidas').insert({
    jogador_1: req.body.jogador_1,
    status: 'CRIADA',
    jogador_atual: req.body.jogador_1,
  }).returning('*');
  res.json({ ...resposta[0], tabuleiro: tabuleiroBase });
});

app.get('/partida/:id', async (req, res) => {
  const partidas = await bancoDeDados('partidas').where('id', req.params.id).first();
  res.json({ ...partidas, tabuleiro: tabuleiroBase });
});

app.put('/partida/:id', async (req, res) => {
  const partidas = await bancoDeDados('partidas').where('id', req.params.id).update({
    jogador_2: req.body.jogador_2,
  }).returning('*');
  res.json({ ...partidas[0], tabuleiro: tabuleiroBase });
});

app.listen(PORT, () => {
  console.log(`O servidor está rodando na porta ${PORT}`);
});
