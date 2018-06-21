const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const controller = {
  create: function(req, res) {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.render('index', { errors: errors.array(), PAGE_TITLE: 'Email subscriptions' })
    }
    return res.render('index', { PAGE_TITLE: 'Email subscriptions' });
  },
  createValidator: [
    check('email').isEmail()
  ],
  read: function(req, res) {
    return res.render('index', { PAGE_TITLE: 'Email subscriptions' });
  }
};

module.exports = controller;
