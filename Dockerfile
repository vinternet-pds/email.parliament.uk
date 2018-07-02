FROM node:8

WORKDIR /app

COPY package*.json /app/

RUN npm install
RUN make css

ADD . /app/

EXPOSE 3000

CMD [ "npm", "start" ]
