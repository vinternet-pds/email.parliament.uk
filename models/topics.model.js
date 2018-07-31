const MailChimp = require('mailchimp-api-v3'),
      mailchimp = new MailChimp(process.env.MC_API_KEY),
      user = require('../models/user.model.js');

const topics = {
  getInterestCategories() {
    return mailchimp.get(`/lists/${process.env.MC_LIST_ID}/interest-categories`).then(result => result.categories.map(value => value.id));
  },
  getInterestCategoryById(id) {
    return mailchimp.get(`/lists/${process.env.MC_LIST_ID}/interest-categories/${id}/interests`);
  },
  getInterestCategoryByIds(ids) {
    const promises = [];

    for (let i = ids.length - 1; i >= 0; i--) {
      promises.push(topics.getInterestCategoryById(ids[i]));
    }

    return Promise.all(promises);
  },
  filterTopicsByUserSubscription(email, subscribedTo, interestCategory) {
    const interests = [];

    // Transform interests into a friendlier array
    for (let i = interestCategory.length - 1; i >= 0; i--) {
      for (let k = interestCategory[i].interests.length - 1; k >= 0; k--) {
        interests.push({
          id: interestCategory[i].interests[k].id,
          title: interestCategory[i].interests[k].name
        });
      }
    }

    // Return new Promise once interests are transformed
    return user.read(email).then(res => new Promise((resolve, reject) => {
      for(key in res.interests) {
        for (let j = interests.length - 1; j >= 0; j--) {
          if(interests[j].id === key && res.interests[key] !== subscribedTo) {
            interests.splice(j, 1);
          }
        }
      }
      resolve(interests);
    }));
  }
};

module.exports = topics;
