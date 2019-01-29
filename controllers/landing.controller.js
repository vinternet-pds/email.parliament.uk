const user = require('../models/user.model.js');

const controller = {
  manage(req, res) {
    return res.render('landing/manage', { PAGE_TITLE: 'Manage your subscriptions' });
  },
  unsubscribe(req, res) {
    return res.render('landing/unsubscribe', { PAGE_TITLE: 'Unsubscribe' });
  },
  handleUnsubscribe(req, res) {
    return user.unsubscribe(req.body.email).then(() => {
      return res.render('landing/unsubscribe', { MESSAGE: 'We\'ve unsubscribed you. You might get email updates in the next 24 hours whilst our system refreshes your details. After this, you will not hear from us again.' });
    }).catch(() => {
      return res.render('landing/unsubscribe', { ERROR: 'There was an error. Please try again.' });
    });
  }
};

module.exports = controller;
