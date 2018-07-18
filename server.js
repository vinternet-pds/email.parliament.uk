const bodyParser = require('body-parser'),
      express    = require('express'),
      session    = require('express-session'),
      app        = express();

const middlewares = [
  express.static('public'),
  bodyParser.urlencoded({ extended: true }),
  bodyParser.json(),
  session({
    secret: process.env.APP_SECRET,
    resave: false,
    saveUninitialized: true
  }),
  (req, res, next) => {
    req.session.errors = [];
    next();
  }
];

app.use(middlewares);

app.set('view engine', 'pug');

app.locals = {
  PUGIN_VERSION: '1.10.2',
  SITE_TITLE: 'UK Parliament'
}

const routes = require('./routes/app.routes.js')(app);

app.listen(3000, () => console.log('App running on :3000'));
