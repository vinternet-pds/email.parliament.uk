FROM node:8

WORKDIR /app

COPY package*.json /app/

RUN npm install

ADD . /app/

EXPOSE 3000

CMD [ "npm", "start" ]
