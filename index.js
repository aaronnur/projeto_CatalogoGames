import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false }
});

// Rota GET - listar todos os jogos
app.get('/jogos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jogos ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar jogos.' });
  }
});

// Rota POST - adicionar novo jogo
app.post('/jogos', async (req, res) => {
  console.log('Corpo recebido:', req.body);
  const { titulo, plataforma, anoLancamento, finalizado } = req.body;

  if (!titulo || !plataforma || !anoLancamento) {
    return res.status(400).json({ mensagem: 'Campos obrigatórios: titulo, plataforma e anoLancamento.' });
  }

  try {
    const query = `
      INSERT INTO jogos (titulo, plataforma, anoLancamento, finalizado)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [titulo, plataforma, anoLancamento, finalizado ?? false];
    const result = await pool.query(query, values);
    res.status(201).json({
      mensagem: 'Jogo adicionado com sucesso.',
      jogo: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao adicionar jogo:', error);
    res.status(500).json({ mensagem: 'Erro interno ao adicionar jogo.' });
  }
});

// Rota PUT - atualizar um jogo existente
app.put('/jogos/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, plataforma, anoLancamento, finalizado } = req.body;

  try {
    const query = `
      UPDATE jogos
      SET titulo = $1, plataforma = $2, anoLancamento = $3, finalizado = $4
      WHERE id = $5
      RETURNING *;
    `;
    const values = [titulo, plataforma, anoLancamento, finalizado, id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    res.status(200).json({
      mensagem: 'Jogo atualizado com sucesso.',
      jogo: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error);
    res.status(500).json({ mensagem: 'Erro interno ao atualizar jogo.' });
  }
});

// Rota DELETE - remover jogo
app.delete('/jogos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM jogos WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    res.status(200).json({
      mensagem: 'Jogo removido com sucesso.',
      jogoRemovido: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao remover jogo:', error);
    res.status(500).json({ mensagem: 'Erro interno ao remover jogo.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
