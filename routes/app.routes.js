const signup_controller = require('../controllers/signup.controller.js'),
      topics_controller = require('../controllers/topics.controller.js'),
      auth_middleware = require('../middlewares/authentication.middleware.js');

module.exports = function(app) {
  app.get('/', signup_controller.index);
  app.post('/', signup_controller.createValidator, signup_controller.handleForm);
  app.get('/thanks', signup_controller.confirmation);
  app.get('/authenticate', signup_controller.authenticate);

  app.get('/topics/:type?', auth_middleware, topics_controller.read);
  app.post('/topics/:type?', auth_middleware, topics_controller.update);
}
