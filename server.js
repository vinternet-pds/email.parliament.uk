const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const app = express();

/* App setup */
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'random secret to set', // todo: set
  resave: false,
  saveUninitialized: true
}));

app.use(function(req, res, next) {
  next();
});

app.set('view engine', 'pug');

app.locals = {
  PUGIN_VERSION: '1.10.1',
  SITE_TITLE: 'UK Parliament'
}

const routes = require('./routes/app.routes.js')(app);

app.listen(3000, () => console.log('App running on :3000'));
