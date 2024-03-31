const jwt = require("jsonwebtoken");
const { jwtsecret } = require("../../config");

function authmiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  const decoded = jwt.verify(token, jwtsecret);
  req.username = decoded.username;

  next();
}

module.exports = authmiddleware;
