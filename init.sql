/* cria a tabela 'jogos' se ela ainda não existir.
*/
CREATE TABLE IF NOT EXISTS jogos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    plataforma VARCHAR(100),
    anoLancamento INT,
    finalizado BOOLEAN DEFAULT false, 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

/*  dados de exemplo.
*/
INSERT INTO jogos (titulo, plataforma, anoLancamento, finalizado) 
VALUES 
('Forza horizon', 'Xbox', 2022, true),
('God of War', 'Playstation 4', 2028, false),
('Hollow Knight', 'Nintendo Switch', 2018, true)
ON CONFLICT (id) DO NOTHING;