FROM node:8

WORKDIR /app

ENV NODE_SASS ./node_modules/.bin/node-sass

COPY package*.json /app/

RUN npm install
RUN mkdir -p public/_css
RUN $(NODE_SASS) --output-style compressed -o public/_css src/stylesheets

ADD . /app/

EXPOSE 3000

CMD [ "npm", "start" ]
