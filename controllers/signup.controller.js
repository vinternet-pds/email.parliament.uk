const user = require('../models/user.model.js');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const controller = {
  index(req, res) {
    return res.render('index', { PAGE_TITLE: 'Email subscriptions' });
  },
  createValidator: [
    check('email').not().isEmpty().withMessage('Email is required'),
    check('email').isEmail().withMessage('Invalid email address entered'),
    check('email').custom((value, { req }) => new Promise((resolve, reject) => {
      // This saves an API call if previous validation doesn't pass
      const errors = validationResult(req);
      if(errors.isEmpty()) {
        // Check email address exists
        user.read(value).then(() => // If user does exist, reject Promise
        reject('An account exists with that email address')).catch(error => {
          if(error.status === 404) {
            // If user doesn't exist, resolve Promise
            return resolve();
          }
        });
      } else {
        // If prior errors, don't run API call
        return resolve();
      }
    })),
    sanitizeBody('email').escape().trim()
  ],
  handleForm(req, res) {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      for (let i = 0; i < errors.array().length; i++) {
        req.session.errors.push({
          message: errors.array()[i].msg
        });
      }
      return res.redirect('/');
    } else {
      req.session.email = req.body.email;

      user.create(req.body.email).then(result => res.redirect('/thanks')).catch(error => {
        req.session.errors.push({
          message: 'An error has occurred. Please try again.'
        });
        return res.redirect('/');
      });
    }
  },
  confirmation(req, res) {
    if(!req.session.email) {
      return res.redirect('/');
    }
    return res.render('thanks', { PAGE_TITLE: 'Thanks for signing up - Email subscriptions', session: req.session })
  },
  authenticate(req, res) {
    user.authenticate(req.query.id).then(result => {
      req.session.user = result;
      return res.redirect('/topics');
    }).catch(error => {
      req.session.errors.push({ 'message': 'No access.' });
      return res.redirect('/');
    });
  }
};

module.exports = controller;
