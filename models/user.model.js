const crypto    = require('crypto'),
      MailChimp = require('mailchimp-api-v3'),
      mailchimp = new MailChimp(process.env.MC_API_KEY);

const user = {
  async authenticate(id) {
    try {
      const account = await mailchimp.get(`/lists/${process.env.MC_LIST_ID}/members?unique_email_id=${id}&fields=total_items,members.email_address,members.id,members.unique_email_id`);
      if(account.total_items === 1) {
        return Promise.resolve(account.members.find(val => val.unique_email_id === id));
      }
    }
    catch(e) {
      return Promise.reject(e);
    }

    return Promise.reject('User does not exist');
  },
  create(email) {
    return mailchimp.post(`/lists/${process.env.MC_LIST_ID}/members`, {
      email_address: email,
      status: 'pending' // With status set to `pending`, it sends a double opt-in confirmation email to the address
    });
  },
  read(email) {
    return mailchimp.get(`/lists/${process.env.MC_LIST_ID}/members/${crypto.createHash('md5').update(email).digest('hex')}`);
  },
  update(userObject) {
    return mailchimp.put(`/lists/${process.env.MC_LIST_ID}/members/${crypto.createHash('md5').update(userObject.email_address).digest('hex')}`, userObject);
  },
  unsubscribe(email) {
    return mailchimp.patch(`/lists/${process.env.MC_LIST_ID}/members/${crypto.createHash('md5').update(email).digest('hex')}`, { status: 'unsubscribed' });
  },
  delete(email) {
    return mailchimp.delete(`/lists/${process.env.MC_LIST_ID}/members/${crypto.createHash('md5').update(email).digest('hex')}`);
  }
};

module.exports = user;
