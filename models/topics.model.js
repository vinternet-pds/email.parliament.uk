const MailChimp = require('mailchimp-api-v3'),
      slugify   = require('slugify'),
      dynamodb  = require('../dynamodb/dynamodb.js'),
      mailchimp = new MailChimp(process.env.MC_API_KEY),
      user      = require('../models/user.model.js');

const topics = {
  sortAlphabetically(a, b) {
    if(a.title < b.title) {
      return -1;
    }
    if(a.title > b.title) {
      return 1;
    }
    return 0;
  },
  async generateMessages(allPromises, subscribingTo) {
    allPromises = await allPromises;
    let string = '';
    let language = {
      action: subscribingTo ? 'subscribed' : 'unsubscribed',
      preposition: subscribingTo ? 'to' : 'from'
    };

    if(allPromises.length === 1) {
      string = allPromises.splice(0, 1).map(val => val.title).join(', ');
    }
    if(allPromises.length === 2) {
      string = allPromises.splice(0, 2).map(val => val.title).join(', and ');
    }
    if(allPromises.length === 3) {
      string = `${allPromises.splice(0, 2).map(val => val.title).join(', ')}, and ${allPromises.splice(0, 1).map(val => val.title)}`;
    }
    if(allPromises.length > 3) {
      string = `${allPromises.splice(0, 3).map(val => val.title).join(', ')}, and ${allPromises.length} more`;
    }

    return `You've ${language.action} ${language.preposition} ${string}.`;
  },
  async convertMergeFieldsToObject(email, merge_fields, subscribeTo) {
    const mergeFieldsObject = {};
    let subscribedAeids = (subscribeTo && subscribeTo !== 'pending') ? merge_fields : [];
    let pendingAeids = (subscribeTo === 'pending') ? merge_fields : [];
    let unsubscribeAeids = (!subscribeTo) ? merge_fields : [];

    try {
      let existingUser = await user.checkIfExists(email);

      for(let existingMergeKey in existingUser.merge_fields) {
        if(existingMergeKey.startsWith('AEID') && !existingMergeKey.startsWith('AEID_PEND')) {
          subscribedAeids = subscribedAeids.concat(existingUser.merge_fields[existingMergeKey].split(',').filter(val => val));
        }
        if(existingMergeKey.startsWith('AEID_PEND')) {
          pendingAeids = pendingAeids.concat(existingUser.merge_fields[existingMergeKey].split(',').filter(val => val));
        }
      }

      let count = 0;
      while(subscribedAeids.length > 0) {
        let newKey = `AEID_${count}`;
        mergeFieldsObject[newKey] = mergeFieldsObject[newKey] || [];

        const concatted = mergeFieldsObject[newKey].concat(subscribedAeids.slice(0, 1));

        if(concatted.join(',').length > 255) {
          count = count + 1;
        } else {
          mergeFieldsObject[newKey] = mergeFieldsObject[newKey].concat(subscribedAeids.splice(0, 1));
        }
      }

    }
    catch(error) {
      console.log('Error finding user:', error);
    }

    mergeFieldsObject.AEID_PEND = (subscribeTo === 'switch') ? [] : pendingAeids;
    for(let key in mergeFieldsObject) {
      mergeFieldsObject[key] = mergeFieldsObject[key].filter(val => !unsubscribeAeids.includes(val)).join(',');
    }

    return mergeFieldsObject;
  },
  convertInterestsArrayToObject(interests, subscribeTo) {
    const object = {};
    for (let i = 0; i < interests.length; i++) {
      object[interests[i]] = subscribeTo;
    }
    return object;
  },
  flattenTopics(topics) {
    let merged = [];
    for(const key in topics) {
      topics[key].forEach(item => {
        merged = merged.concat(item.items);
      });
    }
    return merged;
  },
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
  async getTopicById(topic_id) {
    const allTopics = await this.getTopics();
    return this.flattenTopics(allTopics).find(val => val.id === topic_id);
  },
  async getTopics() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let topics = this.cachedTopics.topics;

    if(this.cachedTopics.last_updated < yesterday) {

      const automatedTopics = await dynamodb.getTopicsFromDynamoDB();
      const interestCategories = await this.getInterestCategories();
      const editorialInterests = await this.getInterestCategoryByIds(interestCategories);
      let committee_title = 'Committee updates';
      let bill_title = 'Bill updates';

      topics = {
        automated: [
          {
            title: committee_title,
            slug: slugify(committee_title).toLowerCase(),
            items: automatedTopics.filter(val => val.type.S === 'committee').map(item => ({
              id: item.topic_id.S,
              aeid: true,
              title: item.title.S,
              description: item.description ? item.description.S : null,
              type: item.type ? item.type.S : null
            })).sort(this.sortAlphabetically)
          },
          {
            title: bill_title,
            slug: slugify(bill_title),
            items: automatedTopics.filter(val => val.type.S === 'public_bill' || val.type.S === 'private_bill').map(item => ({
              id: item.topic_id.S,
              aeid: true,
              title: item.title.S,
              description: item.description ? item.description.S : null,
              type: item.type ? item.type.S : null
            })).sort(this.sortAlphabetically)
          }
        ],
        editorial: interestCategories.map(category => ({
          title: category.title,
          slug: slugify(category.title).toLowerCase(),
          items: editorialInterests.find(interest => category.id == interest.category_id).interests.map(interest => ({
            id: interest.id,
            title: interest.name
          })).sort(this.sortAlphabetically)
        }))
      };

      this.setCachedTopics(topics);
    }

    return topics;
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
    for(const key in preferences.merge_fields) {
      if(key.startsWith('AEID') && !key.startsWith('AEID_PEND')) {
        allMergeFields = allMergeFields.concat(preferences.merge_fields[key].split(',').filter(val => val));
      }
    }

    if(getSubscribed) {
      filterableTopics = this.flattenTopics(filterableTopics);
      return filterableTopics.filter(val => preferences.interests[val.id] || allMergeFields.includes(val.id));
    }

    return filterableTopics;
  }
};

module.exports = topics;
