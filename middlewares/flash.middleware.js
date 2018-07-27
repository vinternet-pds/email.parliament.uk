const middleware = (req, res, next) => {
  res.locals.session = req.session;
  res.locals.sessionErrors = req.session.errors || [];
  req.session.errors = [];
  next();
}

module.exports = middleware;
