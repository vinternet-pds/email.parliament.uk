const index_controller = require('../controllers/index.controller.js');

module.exports = function(app) {
  app.get('/', index_controller.read);
  app.post('/', index_controller.createValidator, index_controller.create);
}
