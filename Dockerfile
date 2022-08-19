FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --registry https://repo.huaweicloud.com/repository/npm/

COPY . .

EXPOSE 50007

CMD node src/main.js
