/* eslint-disable no-undef */
// Usamos o 'require' pois é o padrão do Node.js
const express = require('express');
const { Pool } = require('pg'); // Importa o Pool de conexões do 'pg'

// --- 1. Inicialização do Express ---
const app = express();
// Middleware para o Express entender JSON no corpo das requisições
app.use(express.json());

// --- 2. Configuração da Conexão com o Postgres ---
// O 'Pool' lê automaticamente as variáveis de ambiente que definimos
// no 'docker-compose.yml' (DB_HOST, DB_USER, DB_PASSWORD, etc.)
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '5432')
});

// Endpoint de "saúde" da API (bom para testes)
app.get('/', (req, res) => {
  res.status(200).send('API Catálogo de Jogos rodando!');
});

// --- 3. Endpoints do CRUD de Jogos ---

/*
 * Rota: POST /jogos
 * Função: Adiciona um novo jogo ao catálogo.
 */
app.post('/jogos', async (req, res) => {
  // Pega os dados do corpo da requisição (JSON)
  const { titulo, plataforma, anoLancamento, finalizado } = req.body;

  // Validação simples
  if (!titulo) {
    return res.status(400).json({ error: 'O campo "titulo" é obrigatório.' });
  }

  try {
    // Insere no banco e retorna o 'id' do jogo criado
    // Usamos $1, $2, etc. para Prevenção de SQL Injection
    const { rows } = await pool.query(
      'INSERT INTO jogos (titulo, plataforma, anoLancamento, finalizado) VALUES ($1, $2, $3, $4) RETURNING id',
      [titulo, plataforma, anoLancamento, finalizado]
    );
    // Retorna o status 201 (Created) e o ID do novo jogo
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao inserir jogo no banco.' });
  }
});

/*
 * Rota: GET /jogos
 * Função: Lista TODOS os jogos cadastrados.
 */
app.get('/jogos', async (req, res) => {
  try {
    // Seleciona todos os jogos da tabela, ordenados por id
    const { rows } = await pool.query('SELECT * FROM jogos ORDER BY id ASC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar jogos.' });
  }
});

/*
 * Rota: GET /jogos/:id
 * Função: Busca um único jogo pelo seu ID.
 */
app.get('/jogos/:id', async (req, res) => {
  const { id } = req.params; // Pega o ID da URL
  try {
    const { rows, rowCount } = await pool.query('SELECT * FROM jogos WHERE id = $1', [id]);

    // rowCount é o número de linhas que o SELECT encontrou
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Jogo não encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar jogo.' });
  }
});

/*
 * Rota: PUT /jogos/:id
 * Função: Atualiza um jogo existente pelo seu ID.
 */
app.put('/jogos/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, plataforma, anoLancamento, finalizado } = req.body;

  try {
    const { rowCount } = await pool.query(
      'UPDATE jogos SET titulo = $1, plataforma = $2, anoLancamento = $3, finalizado = $4 WHERE id = $5',
      [titulo, plataforma, anoLancamento, finalizado, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Jogo não encontrado.' });
    }
    res.status(200).json({ updated: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar jogo.' });
  }
});

/*
 * Rota: DELETE /jogos/:id
 * Função: Deleta um jogo pelo seu ID.
 */
app.delete('/jogos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM jogos WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Jogo não encontrado.' });
    }
    // Retorna 204 (No Content) que significa "sucesso, sem conteúdo para retornar"
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar jogo.' });
  }
});

// --- 4. Inicia o Servidor ---
// Ouve na porta 3000 (definida no Dockerfile e docker-compose.yml)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});