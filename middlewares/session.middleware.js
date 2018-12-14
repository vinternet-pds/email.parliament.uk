const session  = require('express-session'),
      ddb      = require('../dynamodb/helper.js'),
      ddbstore = require('connect-dynamodb')({ session: session });

let sessionOptions = {
  cookie: {},
  name: 'sessionId',
  resave: false,
  saveUninitialized: true,
  secret: process.env.APP_SECRET
};
let ddbstoreOptions = {
  table: 'sessions',
  hashKey: 'session_id',
  client: ddb
};

if(process.env.NODE_ENV === 'production') {
  sessionOptions.cookie.secure = true;
  sessionOptions.store = new ddbstore(ddbstoreOptions);
}

module.exports = session(sessionOptions);
