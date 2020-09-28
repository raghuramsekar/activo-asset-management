const express = require('express');
const route = express.Router();

route.get('/', (req, res) => {
  res.json({ msg: 'successful get request' });
});

module.exports = route;
