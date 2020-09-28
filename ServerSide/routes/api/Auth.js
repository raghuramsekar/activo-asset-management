/* eslint-env node */
const express = require('express');
const route = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../Controller_middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { userExists } = require('../../Data_middleware/User');
const jwtgeneration = require('../../Controller_middleware/jwtgeneration');
const { accountInfo } = require('../../Data_middleware/Account');

route.get('/', auth, async (req, res) => {
  try {
    const user = userExists('_id', req.user.id);
    user
      .then((userdoc) => {
        return res.json(userdoc);
      })
      .catch(() => {
        return res.status(400).json({ msg: 'token not provided' });
      });
  } catch (err) {
    return res.status(401).send('server error');
  }
});

//@route   post api/users
//@desc    login details
//@access  public
route.post(
  '/',
  [
    check('email', 'please enter a valid email').isEmail(),
    check('password', 'Please enter password').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      //checks if user already available
      let user = userExists('email', email);
      user
        .then((userdoc) => {
          console.log(userdoc);
          if (!userdoc) {
            return res.status(400).json('Invalid Credentials');
          }
          const account = accountInfo('email', email);
          account
            .then(async (accountdoc) => {
              console.log(accountdoc);
              const isMatch = await bcrypt.compare(
                password,
                accountdoc.password
              );
              console.log(isMatch);
              if (!isMatch) {
                res.status(400).json('Invalid credentials');
              } else {
                const token = jwtgeneration(userdoc._id, userdoc.name);
                token
                  .then((tokendoc) => {
                    return res.json({
                      accessToken: tokendoc.accessToken,
                      refreshToken: tokendoc.refreshToken,
                      name: userdoc.name,
                      empId: userdoc.empId,
                      role: userdoc.role,
                    });
                  })
                  .catch(() => {
                    return res.status(400).json('user not valid');
                  });
              }
            })
            .catch(() => {
              res.status(400).json('user not valid');
            });
        })
        .catch(() => {
          return res.status(400).json('server error');
        });
    } catch (err) {
      //console.error(err.message);
      res.status(400).send('server error');
    }
  }
);

route.get('/refresh', auth, async (req, res) => {
  const token = jwtgeneration(req.user.id, req.user.name);
  token
    .then((tokendoc) => {
      return res.json({
        accessToken: tokendoc.accessToken,
        refreshToken: tokendoc.refreshToken,
      });
    })
    .catch(() => {
      return res.status(400).json({ msg: 'user not valid' });
    });
});

module.exports = route;
