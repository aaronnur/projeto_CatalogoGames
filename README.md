# projeto_CatalogoGames
catálogo de jogos

Projeto Integrador – Cloud Developing 2025/1
CRUD simples + API Gateway + Lambda /report + RDS + CI/CD

10417095- Aaron Magalhães

1 Visão geral
O domínio de negócio escolhido foi um Catálogo de Jogos Pessoal. Este tema foi selecionado por ser um CRUD clássico, de fácil entendimento e implementação, permitindo focar o esforço principal do projeto na configuração da arquitetura de nuvem na AWS, que é o objetivo da avaliação.

O sistema expõe uma API RESTful para gerenciar uma coleção de jogos, permitindo ao usuário:

POST /jogos: Adicionar um novo jogo ao catálogo.

GET /jogos: Listar todos os jogos cadastrados.

GET /jogos/{id}: Obter um jogo específico pelo seu ID.

PUT /jogos/{id}: Atualizar as informações de um jogo (ex: marcar como finalizado).

DELETE /jogos/{id}: Remover um jogo do catálogo.

GET /report: Obter um relatório estatístico (gerado pela função Lambda) sobre a coleção, como o número total de jogos, quantos foram finalizados, etc.

Camada,Serviço,Descrição
Backend,ECS Fargate,API REST em Node.js (Express) rodando em contêineres Fargate em sub-rede privada.
Banco,Amazon RDS,"Banco de dados PostgreSQL em sub-rede privada, sem acesso público."
Gateway,Amazon API Gateway,Roteia todas as rotas CRUD (via VPC Link) → NLB (ECS) · Rota /report → Lambda.
Função,AWS Lambda,"Consome a própria API (via /jogos interna), gera estatísticas JSON e as retorna. Não acessa o RDS."
CI/CD,(Opcional) CodePipeline + GitHub,push → build (CodeBuild) → push imagem (ECR) → deploy (ECS).

2 Como rodar localmente
Pré-requisitos
Node.js (v18+)

Docker e Docker Compose

Passos
Clone este repositório: git clone https://github.com/aaronnur/projeto_CatalogoGames.git

Entre na pasta: cd projeto_CatalogoGames

Crie seu arquivo de variáveis de ambiente a partir do exemplo:

Bash

cp .env.example .env
(Opcional) Edite o arquivo .env se quiser trocar o usuário ou senha do banco de dados local.

Suba os contêineres (API + Banco de Dados Postgres):

Bash

docker compose up --build
A API estará disponível em http://localhost:3000.

Testando localmente (com Thunder Client / Postman)
GET http://localhost:3000/jogos (Listar todos)

POST http://localhost:3000/jogos (Criar novo, com JSON no body)

4 Endpoints da API na Nuvem
A API está implantada no API Gateway e pode ser acessada publicamente através da seguinte URL base (Estágio v1):

https://andyd95ru4.execute-api.us-east-1.amazonaws.com/v1

Endpoints disponíveis:
GET /jogos

Lista todos os jogos no catálogo.

POST /jogos

Adiciona um novo jogo. Exemplo de Body (JSON):

JSON

{
  "titulo": "Bloodborne",
  "plataforma": "Playstation 4",
  "anoLancamento": 2015,
  "finalizado": true
}
GET /jogos/{id}

Busca um jogo específico pelo seu ID. (Ex: /jogos/1)

PUT /jogos/{id}

Atualiza um jogo. Exemplo de Body (JSON):

JSON

{
  "titulo": "Bloodborne - Zerado!",
  "finalizado": true
}
DELETE /jogos/{id}

Deleta um jogo específico.

GET /report

Retorna um relatório estatístico (JSON) sobre a coleção, gerado pela função Lambda.
