var model = require('../models/topics.model.js');

const controller = {
  create: function(req, res) {
    // TODO: Integrate topic subscription logic with Mail API
  },
  read: function(req, res) {
    return res.render('topics/list', { PAGE_TITLE: 'All topics', TOPICS: model.getAll() });
  },
  read_subscribed: function(req, res) {
    return res.render('topics/list-subscribed', { PAGE_TITLE: 'Your subscribed topics', TOPICS: model.getSubscribed() });
  },
  update_subscribed: function(req, res) {
    // TODO: Implement updated subscription logic with Mail API
    return res.render('topics/list-subscribed', { PAGE_TITLE: 'Your subscribed topics', TOPICS: model.getSubscribed() });
  }
};

module.exports = controller;
