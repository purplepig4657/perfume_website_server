const { User } = require("../../database/models/user");

let auth = (req, res, next) => {
  let token = req.cookies.x_auth;

  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, error: true });
      req.token = token;
      req.user = user;
      next();
    }).catch((err) => {
      throw err;
    });
};

module.exports = { auth };
