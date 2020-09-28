const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');
const { userExists } = require('../Data_middleware/User');
module.exports = function (req, res, next) {
  //Get token from header
  const token = req.header('authorize');

  //check if token exists
  if (!token) {
    return res.status(401).json({ msg: 'No token,authorization denied' });
  }

  //verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ msg: 'Token not valid' });
  }
};
