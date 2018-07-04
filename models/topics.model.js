const dummyTopics = require('../json/topics.json');

const topics = {
  getAll: function() {
    const allTopics = {
      'newsletters': [],
      'debates': [],
      'news': [],
      'research': [],
      'mps': [],
      'committee': [],
      'bill': []
    };

    for (var i = 0; i < dummyTopics.length; i++) {
      if(dummyTopics[i].Visibility == 'Listed') {
        if(dummyTopics[i].Code.indexOf('_Bill_') != -1) {
          allTopics.bill.push(dummyTopics[i]);
        } else if(dummyTopics[i].Name.indexOf('Committee') != -1) {
          allTopics.committee.push(dummyTopics[i]);
        } else {
          allTopics.newsletters.push(dummyTopics[i]);
        }
      }
    }

    return allTopics;
  }
};

module.exports = topics;
