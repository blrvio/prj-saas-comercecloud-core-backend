# Use a imagem oficial do Node.js Alpine como base
FROM node

# Defina o diretório de trabalho no container
WORKDIR /usr/src/app

# Copie os arquivos do projeto para o container
COPY package*.json ./

# Instale as dependências do projeto
RUN yarn install
RUN apk --no-cache add curl

# Copie o restante dos arquivos do projeto para o container
COPY . .

# Exponha a porta que a aplicação usará
EXPOSE 3000

HEALTHCHECK --interval=5m --timeout=3s CMD curl -f http://localhost:3000/healthcheck/ || exit 1

# Comando para rodar a aplicação
CMD ["yarn", "start"]



# API First
# CI/CD