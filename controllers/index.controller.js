const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const controller = {
  create: function(req, res) {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.render('index', { errors: errors.array(), PAGE_TITLE: 'Email subscriptions' })
    }
    req.session.email = req.body.email;
    return res.redirect('/thanks');
  },
  createValidator: [
    check('email').isEmail()
  ],
  read: function(req, res) {
    return res.render('index', { PAGE_TITLE: 'Email subscriptions' });
  }
};

module.exports = controller;
