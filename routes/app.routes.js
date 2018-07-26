const signup_controller = require('../controllers/signup.controller.js');
const topics_controller = require('../controllers/topics.controller.js');

module.exports = function(app) {
  app.get('/', signup_controller.index);
  app.post('/', signup_controller.createValidator, signup_controller.handleForm);
  app.get('/thanks', signup_controller.confirmation);
  app.get('/authenticate', signup_controller.authenticate);

  app.get('/topics', topics_controller.read);
  app.post('/topics', topics_controller.create);
  app.get('/topics/subscribed', topics_controller.read_subscribed);
  app.post('/topics/subscribed', topics_controller.update_subscribed);
}
