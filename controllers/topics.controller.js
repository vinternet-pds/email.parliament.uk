var model = require('../models/topics.model.js');

const controller = {
  create: function(req, res) {
    // TODO: Integrate topic subscription logic with Mail API
  },
  read: function(req, res) {
    return res.render('topics', { PAGE_TITLE: 'All topics', TOPICS: model.getAll() });
  }
};

module.exports = controller;
