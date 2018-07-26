FROM node:8

ARG APP_SECRET
ARG MC_API_KEY
ARG MC_LIST_ID

WORKDIR /app

ENV APP_SECRET $APP_SECRET
ENV MC_API_KEY $MC_API_KEY
ENV MC_LIST_ID $MC_LIST_ID

COPY package*.json /app/

RUN npm install
RUN mkdir -p public/_css
CMD ./node_modules/.bin/node-sass --output-style compressed -o public/_css ./src/stylesheets

ADD . /app/

EXPOSE 3000

CMD [ "npm", "start" ]
