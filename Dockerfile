# --- Estágio 1: Base ---
# Começamos com uma imagem oficial do Node.js (versão 18, LTS)
# 'alpine' é uma versão minúscula do Linux, o que torna nossa imagem final muito menor.
FROM node:18-alpine

# --- Estágio 2: Configuração ---
# Define o diretório de trabalho principal dentro do container
# Todos os comandos a seguir serão executados a partir de /app
WORKDIR /app

# --- Estágio 3: Instalação das Dependências ---
# Copia APENAS os arquivos de manifesto do projeto
# O '*' inclui tanto o package.json quanto o package-lock.json
COPY package*.json ./

# Roda o 'npm install' para baixar as dependências (express, pg)
# Isso é feito ANTES de copiar o resto do código para aproveitar o cache do Docker.
RUN npm install

# --- Estágio 4: Adicionar o Código da Aplicação ---
# Agora, copia todo o resto do código (index.js, etc.) para o /app
COPY . .

# --- Estágio 5: Execução ---
# Informa ao Docker que o container vai expor a porta 3000
EXPOSE 3000

# O comando que será executado quando o container iniciar
# É o mesmo que você digitaria no seu terminal: "node index.js"
CMD [ "node", "index.js" ]