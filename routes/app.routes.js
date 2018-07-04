const index_controller = require('../controllers/index.controller.js');
const signup_controller = require('../controllers/signup.controller.js');
const topics_controller = require('../controllers/topics.controller.js');

module.exports = function(app) {
  app.get('/', index_controller.read);
  app.post('/', index_controller.createValidator, index_controller.create);
  app.get('/thanks', signup_controller.read);
  app.get('/topics', topics_controller.read);
  app.post('/topics', topics_controller.create);
  app.get('/topics/subscribed', topics_controller.read_subscribed);
  app.post('/topics/subscribed', topics_controller.update_subscribed);
}
