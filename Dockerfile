FROM node:10.13.0-alpine

ARG APP_SECRET
ARG MC_API_KEY
ARG MC_LIST_ID

WORKDIR /app

ADD . /app/

ENV APP_SECRET $APP_SECRET
ENV MC_API_KEY $MC_API_KEY
ENV MC_LIST_ID $MC_LIST_ID

COPY package*.json /app/

RUN npm install
RUN mkdir -p public/_css

CMD ./node_modules/.bin/node-sass --output-style compressed -o public/_css /src/stylesheets

HEALTHCHECK --interval=5s --timeout=3s CMD curl --fail http://localhost:3000/health-check || exit 1

EXPOSE 3000

CMD [ "npm", "start" ]
