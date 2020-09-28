const jwt = require('jsonwebtoken');
const config = require('config');

async function jwtGeneration(userId, userName) {
  try {
    const payload = { user: { id: userId, name: userName } };
    const accessToken = jwt.sign(payload, config.get('jwtSecret'), {
      expiresIn: '1d',
    });
    const refreshToken = jwt.sign(payload, config.get('jwtSecret'), {
      expiresIn: '10d',
    });
    return { accessToken, refreshToken };
  } catch (err) {
    return 'error';
  }
}

module.exports = jwtGeneration;
