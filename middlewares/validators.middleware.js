const user = require('../models/user.model.js');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const middleware = {
  emailValidator: [
    check('email').not().isEmpty().withMessage('An email address is required.'),
    check('email').isEmail().withMessage('A valid email address is required.'),
    check('email').custom((value, { req }) => {
      const errors = validationResult(req);
      if(errors.isEmpty()) {
        return user.read(value).then(() => Promise.reject('An account already exists with this email.')).catch(error => {
          if(error.status === 404) {
            // User does not exist - allow to proceed
            return Promise.resolve();
          } else {
            // A different error ocurred - let the user know
            return Promise.reject(error);
          }
        })
      } else {
        // If errors already exist, save making an API call
        return Promise.resolve();
      }
    }),
    sanitizeBody('email').escape().trim()
  ]
}

module.exports = middleware;
