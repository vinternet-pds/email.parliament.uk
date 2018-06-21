const bodyParser = require('body-parser');
const express = require('express');

const app = express();

/* App setup */
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'pug');

app.locals = {
  PUGIN_VERSION: '1.9.3',
  SITE_TITLE: 'UK Parliament'
}

const routes = require('./routes/app.routes.js')(app);
app.listen(3000, () => console.log('App running on :3000'));
