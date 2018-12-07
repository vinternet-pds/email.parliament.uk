const user = require('../models/user.model.js');
const { validationResult } = require('express-validator/check');

const controller = {
  index(req, res) {
    return res.render('index', { PAGE_TITLE: 'Email subscriptions' });
  },
  async handleForm(req, res) {
    let redirect = '/';
    const { email } = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      req.session.errors = errors.array().map(message => message.msg);
      return res.redirect(redirect);
    }

    try {
      req.session.email = email;
      await user.create(email);
      redirect = '/thanks';
    }
    catch(e) {
      console.log('Error on signup', JSON.stringify(e)); // For CloudWatch debugging
      req.session.errors.push('An error has occurred. Please try again.');
    }

    return res.redirect(redirect);
  },
  confirmation(req, res) {
    if(!req.session.email) {
      return res.redirect('/');
    }
    return res.render('thanks', { PAGE_TITLE: 'Thanks for signing up - Email subscriptions' })
  },
  async authenticate(req, res) {
    let redirect = req.query.return ? `/${req.query.return}` : '/topics';

    try {
      const account = await user.authenticate(req.query.id);
      req.session.user = account;
    }
    catch(e) {
      console.log('Error on authentication', JSON.stringify(e)); // For CloudWatch debugging
      req.session.errors.push(e);
      redirect = '/';
    }

    return res.redirect(redirect);
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
