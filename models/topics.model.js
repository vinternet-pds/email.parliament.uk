const MailChimp = require('mailchimp-api-v3'),
      aws = require('../dynamodb/helper.js'),
      mailchimp = new MailChimp(process.env.MC_API_KEY),
      user = require('../models/user.model.js');

const topics = {
  cachedTopics: {
    last_updated: null,
    topics: []
  },
  setCachedTopics(topics) {
    this.cachedTopics = {
      last_updated: new Date(),
      topics
    };
    return this.cachedTopics;
  },
  getCachedTopics() {
    return this.cachedTopics;
  },
  async getTopics() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let topics = this.cachedTopics.topics;

    if(this.cachedTopics.last_updated < yesterday) {

      const automatedTopics = await this.getTopicsFromDynamoDB();
      const interestCategories = await this.getInterestCategories();
      const editorialInterests = await this.getInterestCategoryByIds(interestCategories);

      topics = {
        automated: [
          {
            title: 'Committee updates',
            items: automatedTopics.filter(val => val.type.S === 'committee').map(item => ({
              id: item.topic_id.S,
              aeid: true,
              title: item.title.S,
              description: item.description ? item.description.S : null,
              type: item.type ? item.type.S : null
            }))
          },
          {
            title: 'Bill updates',
            items: automatedTopics.filter(val => val.type.S === 'public_bill' || val.type.S === 'private_bill').map(item => ({
              id: item.topic_id.S,
              aeid: true,
              title: item.title.S,
              description: item.description ? item.description.S : null,
              type: item.type ? item.type.S : null
            }))
          }
        ],
        editorial: interestCategories.map(category => ({
          title: category.title,
          items: editorialInterests.find(interest => category.id == interest.category_id).interests.map(interest => ({
            id: interest.id,
            title: interest.name
          }))
        }))
      };

      this.setCachedTopics(topics);
    }

    return topics;
  },
  getTopicsFromDynamoDB(lastScan) {
    this.topics = (lastScan && lastScan.Items) ? this.topics.concat(lastScan.Items) : [];

    const assigned = Object.assign({}, { TableName: 'topics' });

    assigned.ExpressionAttributeValues = {
      ':a': {
        S: '0'
      }
    };
    assigned.FilterExpression = 'enabled <> :a';
    assigned.Limit = 100;

    if(lastScan !== undefined && lastScan.LastEvaluatedKey === undefined) {
      return new Promise((resolve) => {
        resolve(this.topics);
      });
    } else {
      assigned.ExclusiveStartKey = (lastScan && lastScan.LastEvaluatedKey) ? lastScan.LastEvaluatedKey : null;
      return aws.scan(assigned).promise().then((result) => this.getTopicsFromDynamoDB(result));
    }
  },
  getInterestCategories() {
    return mailchimp.get(`/lists/${process.env.MC_LIST_ID}/interest-categories`).then(result => result.categories.map(val => ({
      id: val.id,
      title: val.title
    })));
  },
  getInterestCategoryById(id) {
    return mailchimp.get(`/lists/${process.env.MC_LIST_ID}/interest-categories/${id}/interests`);
  },
  getInterestCategoryByIds(categories) {
    const promises = [];

    for (let i = 0; i < categories.length; i++) {
      promises.push(this.getInterestCategoryById(categories[i].id));
    }

    return Promise.all(promises);
  },
  async filterTopicsByUserSubscription(email, getSubscribed, filterableTopics) {
    const preferences = await user.read(email);

    let allMergeFields = [];
    for(var key in preferences.merge_fields) {
      if(key.startsWith('AEID')) {
        allMergeFields = allMergeFields.concat(preferences.merge_fields[key].split(',').filter(val => val));
      }
    }

    if(getSubscribed) {
      let merged = [];
      for(const key in filterableTopics) {
        filterableTopics[key].forEach(item => {
          merged = merged.concat(item.items.filter(val => preferences.interests[val.id] || allMergeFields.includes(val.id)));
        });
      }
      filterableTopics = merged;
    }

    return filterableTopics;
  }
};


module.exports = topics;
