const index_controller = require('../controllers/index.controller.js');
const signup_controller = require('../controllers/signup.controller.js');

module.exports = function(app) {
  app.get('/', index_controller.read);
  app.post('/', index_controller.createValidator, index_controller.create);
  app.get('/thanks', signup_controller.read);
}
