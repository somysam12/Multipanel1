const app = require('../server/server');

module.exports = (req, res) => {
  req.url = `/api${req.url}`;
  return app(req, res);
};
