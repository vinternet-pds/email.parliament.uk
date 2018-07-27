const user = require('../models/user.model.js');
const { validationResult } = require('express-validator/check');

const controller = {
  index(req, res) {
    return res.render('index', { PAGE_TITLE: 'Email subscriptions' });
  },
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

      user.create(req.body.email).then(() => res.redirect('/thanks')).catch(() => {
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
    return res.render('thanks', { PAGE_TITLE: 'Thanks for signing up - Email subscriptions' })
  },
  authenticate(req, res) {
    let redirect = req.query.return ? `/${req.query.return}` : '/topics';
    user.authenticate(req.query.id).then(result => {
      req.session.user = result;
      return res.redirect(redirect);
    }).catch(() => {
      req.session.errors.push({ 'message': 'No access.' });
      return res.redirect('/');
    });
  },
  update(req, res) {
    user.read(req.session.user.email_address).then(result => res.render('user/index', { PAGE_TITLE: 'Update your details - Email subscriptions', USER: result }));
  },
  updateForm(req, res) {
    const errors = validationResult(req);

    // User hasn't actually changed their email address
    if(req.session.user.email_address === req.body.email) {
      return res.redirect('/user');
    } else if(!errors.isEmpty()) {
      for (let i = 0; i < errors.array().length; i++) {
        req.session.errors.push({
          message: errors.array()[i].msg
        });
      }
      return res.redirect('/user');
    } else {
      const userObject = {
        email_address: req.body.email
      };
      user.update(req.session.user.email_address, userObject).then(result => res.redirect(`/authenticate?id=${result.unique_email_id}&return=user`));
    }
  },
  delete(req, res) {
    return res.render('user/delete', { PAGE_TITLE: 'Are you sure? - Email subscriptions' });
  },
  deleteConfirmation(req, res) {
    user.delete(req.session.user.email_address).then(() => {
      req.session.user = null;
      return res.render('user/delete-confirmation', { PAGE_TITLE: 'Goodbye - Email subscriptions' });
    });
  }
};

module.exports = controller;
