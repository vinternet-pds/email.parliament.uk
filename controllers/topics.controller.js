const topics = require('../models/topics.model.js'),
      user   = require('../models/user.model.js');

const controller = {
  update(req, res) {
    const redirect = req.params.type ? '/topics/subscribed' : '/topics';

    if('interests' in req.body) {
      let userObject = {
        email: req.session.user.email_address,
        interests: {}
      };

      for (let i = 0; i < req.body.interests.length; i++) {
        userObject.interests[req.body.interests[i]] = (req.params.type ? false : true);
      }

      return user.update(req.session.user.email_address, userObject).then(() => res.redirect(redirect));
    }

    // Otherwise, just show the topics page again
    return res.redirect(redirect);
  },
  read(req, res) {
    const getSubscribed = req.params.type ? true : false;
    const view = req.params.type ? 'topics/list-subscribed' : 'topics/list';
    const title = req.params.type ? 'Your subscribed topics' : 'All topics';

    topics.getInterestCategories()
      .then(topics.getInterestCategoryByIds)
      .then(topics.filterTopicsByUserSubscription.bind(null, req.session.user.email_address, getSubscribed))
      .then(result => res.render(view, { PAGE_TITLE: title, TOPICS: result }));
  }
};

module.exports = controller;
