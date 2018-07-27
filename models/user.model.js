const crypto    = require('crypto'),
      MailChimp = require('mailchimp-api-v3'),
      mailchimp = new MailChimp(process.env.MC_API_KEY);

const user = {
  authenticate(id) {
    const promise = new Promise((resolve, reject) => {
      mailchimp.get(`/lists/${process.env.MC_LIST_ID}/members?unique_email_id=${id}&fields=total_items,members.email_address,members.id`).then(result => {
        if(result.total_items === 1) {
          return resolve(result.members[0]);
        } else {
          return reject('User does not exist');
        }
      }).catch(error => reject(error));
    });
    return promise;
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
  update(email, userObject) {
    return mailchimp.put(`/lists/${process.env.MC_LIST_ID}/members/${crypto.createHash('md5').update(email).digest('hex')}`, userObject);
  },
  unsubscribe(email) {
    return mailchimp.patch(`/lists/${process.env.MC_LIST_ID}/members/${crypto.createHash('md5').update(email).digest('hex')}`, { status: 'unsubscribed' });
  },
  delete(email) {
    return mailchimp.delete(`/lists/${process.env.MC_LIST_ID}/members/${crypto.createHash('md5').update(email).digest('hex')}`);
  }
};

module.exports = user;
