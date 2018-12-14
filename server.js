const bodyParser = require('body-parser'),
      express    = require('express'),
      app        = express();

const middlewares = [
  express.static('public'),
  bodyParser.urlencoded({ extended: true }),
  bodyParser.json(),
  require('./middlewares/session.middleware.js'),
  require('./middlewares/flash.middleware.js')
];

if(app.get('env') === 'production') {
  app.set('trust proxy', 1);
}

app.use(middlewares);
app.set('view engine', 'pug');

app.locals = {
  PUGIN_VERSION: '1.11.8',
  SITE_TITLE: 'Email subscriptions - UK Parliament'
}

const routes = require('./routes/app.routes.js')(app);

app.listen(3000, () => console.log('App running on :3000'));
