const topics = require('../models/topics.model.js'),
      user   = require('../models/user.model.js');

const controller = {
  update(req, res) {
    const redirect = req.params.type ? '/topics/subscribed' : '/topics';
    let userObject = {
      email: req.session.user.email_address
    };

    if('merge_fields' in req.body) {
      userObject.merge_fields = { AEID: req.body.merge_fields.join(',') };
    }

    if('interests' in req.body) {
      userObject.interests = {};

      for (let i = 0; i < req.body.interests.length; i++) {
        userObject.interests[req.body.interests[i]] = (req.params.type ? false : true);
      }
    }

    if(userObject.interests || userObject.merge_fields) {
      return user.update(req.session.user.email_address, userObject).then(() => res.redirect(redirect));
    }

    // Otherwise, just show the topics page again
    return res.redirect(redirect);
  },
  async read(req, res) {
    const getSubscribed = req.params.type ? true : false;
    const view = req.params.type ? 'topics/list-subscribed' : 'topics/list';
    const title = req.params.type ? 'Your subscribed topics' : 'All topics';
    const allTopics = await topics.getTopics();
    const currentUser = await user.read(req.session.user.email_address);
    const filteredTopics = await topics.filterTopicsByUserSubscription(req.session.user.email_address, getSubscribed, allTopics);

    return res.render(view, { PAGE_TITLE: title, TOPICS: filteredTopics });
  }
};

module.exports = controller;
