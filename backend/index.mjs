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

const gerarTabuleiroBase = () => [
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];

const compararListas = (lista1, lista2) => {
  for (let i = 0; i < lista1.length; i++) {
    if (lista1[i] !== lista2[i]) return false;
  }
  return true;
}

function statusJogadas(jogadas) {
  const tabuleiro = gerarTabuleiroBase();
  for (const jogada of jogadas) {
    const [linha, coluna] = jogada.coordenadas.split(',');
    tabuleiro[linha][coluna] = jogada.valor;
  }

  for (const linha of tabuleiro) {
    console.log('comparando linha: ', linha);
    if (compararListas(linha, ['X', 'X', 'X'])) return 'jogador_1';
    if (compararListas(linha, ['O', 'O', 'O'])) return 'jogador_2';
  }
  for (const indiceColuna of [0, 1, 2]) {
    const coluna = [
      tabuleiro[0][indiceColuna],
      tabuleiro[1][indiceColuna],
      tabuleiro[2][indiceColuna],
    ]
    console.log('comparando coluna: ', coluna);
    if (compararListas(coluna, ['X', 'X', 'X'])) return 'jogador_1';
    if (compararListas(coluna, ['O', 'O', 'O'])) return 'jogador_2';
  }
  const diagonal1 = [
    tabuleiro[0][0],
    tabuleiro[1][1],
    tabuleiro[2][2],
  ]
  const diagonal2 = [
    tabuleiro[0][2],
    tabuleiro[1][1],
    tabuleiro[2][0],
  ]
  console.log('comparando diagonais: ', diagonal1, diagonal2);
  if (compararListas(diagonal1, ['X', 'X', 'X'])) return 'jogador_1';
  if (compararListas(diagonal1, ['O', 'O', 'O'])) return 'jogador_2';
  if (compararListas(diagonal2, ['X', 'X', 'X'])) return 'jogador_1';
  if (compararListas(diagonal2, ['O', 'O', 'O'])) return 'jogador_2';

  console.log('comparando empate: ', jogadas.length);
  if (jogadas.length === 9) return 'empate';

  return 'em_andamento';
}

app.post('/partida', async (req, res) => {
  const resposta = await bancoDeDados('partidas').insert({
    jogador_1: req.body.jogador_1,
    status: 'CRIADA',
  }).returning('*');
  res.json({ ...resposta[0], tabuleiro: gerarTabuleiroBase() });
});

app.get('/partida/:id', async (req, res) => {
  const { id } = req.params;
  const partidas = await bancoDeDados('partidas').where('id', id).first();
  const jogadas = await bancoDeDados('jogadas').where('partida_id', id);
  const tabuleiro = gerarTabuleiroBase();
  for (const jogada of jogadas) {
    const [linha, coluna] = jogada.coordenadas.split(',');
    tabuleiro[linha][coluna] = jogada.valor;
  }
  res.json({ ...partidas, tabuleiro });
});

app.put('/partida/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const partida = await bancoDeDados('partidas').where('id', id).first();

    if (partida.jogador_2) {
      res.json(403, { mensagem: 'A sala já está cheia' });
    } else {
      const jogador_da_vez = Math.round(Math.random());
      const { jogador_2 } = req.body;
      const partidas = await bancoDeDados('partidas').where('id', id).update({
        jogador_2,
        status: 'EM_ANDAMENTO',
        jogador_atual: jogador_da_vez === 1 ? partida.jogador_1 : jogador_2,
      }).returning('*');
      res.json({ ...partidas[0], tabuleiro: gerarTabuleiroBase() });
    }
  } catch(e) {
    console.error(e);
    res.sendStatus(404);
  }
});

app.post('/partida/:partida_id/jogada/', async (req, res) => {
  const { partida_id } = req.params;
  const partida = await bancoDeDados('partidas').where('id', partida_id).first();
  const { jogador, coordenadas } = req.body;
  // let valor = 'X';
  // if (jogador === partida.jogador_2) {
  //   valor = 'O';
  // }
  try {
    if (partida.status === 'FINALIZADA') {
      res.json(400, { mensagem: 'A partida já foi finalizada!' });
    } else if (jogador === partida.jogador_atual) {
      await bancoDeDados('jogadas').insert({
        partida_id,
        jogador,
        coordenadas: coordenadas.toString(),
        valor: jogador === partida.jogador_1 ? 'X' : 'O',
      }).returning('*');

      const jogadas = await bancoDeDados('jogadas').where('partida_id', partida_id);
      const status = statusJogadas(jogadas);

      if (status === 'em_andamento') {
        await bancoDeDados('partidas').where('id', partida_id).update({
          jogador_atual: partida.jogador_atual === partida.jogador_1 ? partida.jogador_2 : partida.jogador_1,
        }).returning('*');
      } else {
        let vencedor = null;
        if (status === 'jogador_1') {
          vencedor = partida.jogador_1;
        } else if (status === 'jogador_2') {
          vencedor = partida.jogador_2;
        }

        await bancoDeDados('partidas').where('id', partida_id).update({
          jogador_atual: null,
          vencedor,
          status: 'FINALIZADA'
        }).returning('*');
      }
      res.sendStatus(200);
    } else {
      res.json(400, { mensagem: 'Vez do outro jogador' });
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});


app.listen(PORT, () => {
  console.log(`O servidor está rodando na porta ${PORT}`);
});
