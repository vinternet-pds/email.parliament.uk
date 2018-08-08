const user = require('../models/user.model.js');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const middleware = {
  emailValidator: [
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
  ]
}

module.exports = middleware;
