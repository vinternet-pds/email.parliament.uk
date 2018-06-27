const controller = {
  read: function(req, res) {
    if(!req.session.email) {
      return res.redirect('/');
    }
    // Todo: integrate Mail API to create subscription
    return res.render('thanks', { PAGE_TITLE: 'Thanks for signing up - Email subscriptions', session: req.session });
  }
};

module.exports = controller;
