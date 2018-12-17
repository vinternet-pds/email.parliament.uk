const { assert } = require('chai'),
      sinon      = require('sinon'),
      model      = require('../../models/topics.model.js'),
      expected   = require('../expected/topics.model.json'),
      fixtures   = require('../fixtures/topics.model.json');

describe('Topics - Model', () => {

  let sandbox;
  let fakeTopicIds = ['6d2bcf21', 'ddc13e0b', '5a003216', '1d939436'];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(model, 'getTopics').callsFake(async () => fixtures.all);
  });

  afterEach(() => {
    sandbox = sandbox.restore();
  });

  describe('generateMessages: subscribed', () => {
    it('returns a string of subscribed to one topic', async () => {
      let topicIds = fakeTopicIds.slice(0, 1).map(val => model.getTopicById(val));
      const result = await model.generateMessages(Promise.all(topicIds), true);
      return assert.equal(result, 'You\'ve subscribed to Economic Affairs Committee.');
    });
    it('returns a string of subscribed to two topics', async () => {
      let topicIds = fakeTopicIds.slice(0, 2).map(val => model.getTopicById(val));
      const result = await model.generateMessages(Promise.all(topicIds), true);
      return assert.equal(result, 'You\'ve subscribed to Economic Affairs Committee, and Welsh Grand Committee.');
    });
    it('returns a string of subscribed to three topics', async () => {
      let topicIds = fakeTopicIds.slice(0, 3).map(val => model.getTopicById(val));
      const result = await model.generateMessages(Promise.all(topicIds), true);
      return assert.equal(result, 'You\'ve subscribed to Economic Affairs Committee, Welsh Grand Committee, and International Relations Committee.');
    });
    it('returns a string of subscribed to three and more topics', async () => {
      let topicIds = fakeTopicIds.slice(0, 4).map(val => model.getTopicById(val));
      const result = await model.generateMessages(Promise.all(topicIds), true);
      return assert.equal(result, 'You\'ve subscribed to Economic Affairs Committee, Welsh Grand Committee, International Relations Committee, and 1 more.');
    });
  });

  describe('generateMessages: unsubscribed', () => {
    it('returns a string of unsubscribed from one topic', async () => {
      let topicIds = fakeTopicIds.slice(0, 1).map(val => model.getTopicById(val));
      const result = await model.generateMessages(Promise.all(topicIds), false);
      return assert.equal(result, 'You\'ve unsubscribed from Economic Affairs Committee.');
    });
    it('returns a string of unsubscribed from two topics', async () => {
      let topicIds = fakeTopicIds.slice(0, 2).map(val => model.getTopicById(val));
      const result = await model.generateMessages(Promise.all(topicIds), false);
      return assert.equal(result, 'You\'ve unsubscribed from Economic Affairs Committee, and Welsh Grand Committee.');
    });
    it('returns a string of unsubscribed from three topics', async () => {
      let topicIds = fakeTopicIds.slice(0, 3).map(val => model.getTopicById(val));
      const result = await model.generateMessages(Promise.all(topicIds), false);
      return assert.equal(result, 'You\'ve unsubscribed from Economic Affairs Committee, Welsh Grand Committee, and International Relations Committee.');
    });
    it('returns a string of unsubscribed from three and more topics', async () => {
      let topicIds = fakeTopicIds.slice(0, 4).map(val => model.getTopicById(val));
      const result = await model.generateMessages(Promise.all(topicIds), false);
      return assert.equal(result, 'You\'ve unsubscribed from Economic Affairs Committee, Welsh Grand Committee, International Relations Committee, and 1 more.');
    });
  });

});
