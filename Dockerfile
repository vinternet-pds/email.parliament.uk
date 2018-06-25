FROM node:8

WORKDIR /app

ADD package*.json ./

RUN npm install

ADD . /app

EXPOSE 3000

CMD ["npm", "start"]
