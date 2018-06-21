const express = require('express');
const app = express();

/* App setup */
app.use(express.static('public'));
app.set('view engine', 'pug');

app.locals = {
  PUGIN_VERSION: '1.9.3'
}

app.get('/', (req, res) => res.render('master'));

app.listen(3000, () => console.log('App running on :3000'));
