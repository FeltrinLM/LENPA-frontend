# ESTÁGIO 1: Build (Compilação)
FROM node:20-alpine AS build
WORKDIR /app

# Copia os arquivos de dependência primeiro (aproveita cache)
COPY package*.json ./
# npm ci é mais rápido e seguro que npm install para builds automatizados
RUN npm ci

# Copia o resto do código e faz o build
COPY . .
RUN npm run build

# ESTÁGIO 2: Run (Execução do Servidor SSR)
FROM node:20-alpine
WORKDIR /app

# Copia apenas a pasta dist (onde está o build) gerada no estágio anterior
COPY --from=build /app/dist/LENPA-frontend ./dist/LENPA-frontend
COPY --from=build /app/package.json ./

# Expõe a porta padrão que o Angular SSR usa (4000)
EXPOSE 4000

# Executa o script que você tem no seu package.json
CMD ["node", "dist/LENPA-frontend/server/server.mjs"]
