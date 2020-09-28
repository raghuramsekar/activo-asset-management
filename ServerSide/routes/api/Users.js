const express = require('express');
const { check, validationResult } = require('express-validator');
const registerUser = require('../../Controller_middleware/registerUser');
const route = express.Router();
const {
  userExists,
  deleteAll,
  userCount,
  userPaginate,
  userUpdate,
} = require('../../Data_middleware/User');
const jwtgeneration = require('../../Controller_middleware/jwtgeneration');
const auth = require('../../Controller_middleware/auth');
const paginate = require('express-paginate');
const User = require('../../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Account = require('../../models/Account');
const nodemailer = require('nodemailer');

//@route   post api/users
//@desc    login details
//@access  public
route.post(
  '/addition',
  [
    check('name', 'please enter a name').not().isEmpty(),
    check('email', 'please enter a valid email').isEmail(),
    check(
      'password',
      'please enter a password with 8 or more characters'
    ).isLength({ min: 8 }),
    check('status', 'Please enter your status').not().isEmpty(),
    check('role', 'please enter your role').not().isEmpty(),
    check('empId', 'please enter your employee id').not().isEmpty(),
  ],
  async (req, res) => {
    //validating essential for registering user
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    let { email } = req.body;
    try {
      //checks if user already available
      let user = userExists('email', email);

      user
        .then((userDoc) => {
          if (userDoc == null) {
            //registering a user
            const user = registerUser(req.body);
            user
              .then((userDoc) => {
                if (userDoc != 'error') {
                  res.json('User addition successful');
                } else {
                  throw 'error';
                }
              })
              .catch((err) => {
                return res.status(400).json('User already exists');
              });
          } else {
            throw 'error';
          }
        })
        .catch((err) => {
          return res.status(400).json('User already exists');
        });
    } catch (err) {
      res.status(400).send('User already exists');
    }
  }
);

//@route   Delete api/users
//@desc    Delete
//@access  private

route.delete('/', auth, async (req, res) => {
  const user = deleteAll();
  user
    .then(() => {
      Account.deleteMany({}).then(() => {
        return res.json('all deleted');
      });
    })
    .catch((err) => {
      res.status(400).json('Deletion failed');
    });
});

//@route   get api/users/search
//@desc    Search user
//@access  private

route.get('/search', async (req, res) => {
  let user = '';
  if (req.query.search.includes('@')) {
    user = userExists('email', req.query.search);
  } else {
    console.log(req.query.search);
    user = userExists('empId', req.query.search);
  }
  user.then((userDoc) => {
    if (userDoc == null) {
      console.log("inside userDoc");
      return res.status(401).json('user does not exist');
    } else {
      res.json({ data: [userDoc], hasMore: false });
    }
  });
});

//@route   get api/users/alluser
//@desc    all users paginated
//@access  private

route.get('/alluser', async (req, res) => {
  userPaginate('empId', parseInt(req.query.limit), parseInt(req.query.offset))
    .then((userDoc) => {
      if (userDoc != 'error') {
        //counting all users
        userCount().then((countData) => {
          if (countData != 'error') {
            //pagecount for next pages
            let pageCount = (countData - req.query.offset) / req.query.limit;

            //if pagecount is between 0 and 1 , make pagecount 0
            if (typeof pageCount != 'number' || pageCount < 0) pageCount = 0;
            res.json({
              hasPrev: res.locals.paginate.hasPreviousPages,
              hasMore: paginate.hasNextPages(req)(pageCount),
              data: userDoc,
            });
          } else {
            throw 'error';
          }
        });
      } else {
        throw 'error';
      }
    })
    .catch((err) => {
      res.status(503).json('server error');
    });
});

route.post('/update', async (req, res) => {
  let { name, empId, email, status, role, designation, jira } = req.body;
  userExists('empId', empId)
    .then((userDoc) => {
      //checks if user is already resigned,cannot make update
      if (userDoc.status == 'Resigned')
        return res.status(403).json('user is resigned,cannot make update');
      else {
        //checks with past data and updates if not match
        try {
          if (userDoc.name != name) userUpdate('name', name, userDoc._id);
          if (userDoc.empId != empId) userUpdate('empId', empId, userDoc._id);
          if (userDoc.email != email) userUpdate('email', email, userDoc._id);
          if (userDoc.role != role) userUpdate('role', role, userDoc._id);
          if (userDoc.designation != designation)
            userUpdate('designation', designation, userDoc._id);
          if (userDoc.jira != jira) userUpdate('jira', jira, userDoc._id);
          if (userDoc.status != status)
            userUpdate('status', status, userDoc._id);
          res.json({ msg: 'user update successful' });
        } catch (err) {
          throw 'error';
        }
      }
    })
    .catch((err) => {
      res.status(400).json('user update unsuccessful');
    });
});

route.get('/forgotpassword', async (req, res) => {
  const email = req.query.email;
  let query = {};
  query['email'] = email;
  User.findOne(query).then(async (userDoc) => {
    if (userDoc != null) {
      //Creating a token
      const token = crypto.randomBytes(20).toString('hex');

      //token updated in user reset
      userUpdate('reset', token, userDoc._id);

      //token expiration time 1 hour is updated in resetTime
      const time = new Date().getTime() + 60 * 60 * 1000;
      userUpdate('resetTime', time, userDoc._id);

      //Mail send with token using nodemailer
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'skavanode@gmail.com',
          pass: `Skava@123`,
        },
      });

      //verifying mail server working
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log('Server is ready to take our messages');
        }
      });

      //Mail authentication and body
      const mailOptions = {
        from: 'skavanode@gmail.com',
        to: email,
        subject: 'Link to reset password',
        text:
          `Seems like you forgot your password for Activo asset management\n\n` +
          `Click the link below ` +
          `http://localhost:3000/reset/` +
          token +
          `\n\n` +
          ' if you did not forgot your password, You can safely ignore this email',
      };

      //Final mail sending
      transporter.sendMail(mailOptions, (err, response) => {
        if (err) console.error(err.message);
        else {
          console.log('success');
          res.status(200).json('mail sent for requested mail Id');
        }
      });
    } else {
      res.status(400).json('check Mail Id');
    }
  });
});

route.get('/tokencheck', async (req, res) => {
  const token = req.query.token;

  userExists('reset', token)
    .then((userDoc) => {
      //checks for token
      if (userDoc.length == 0) {
        return res.status(400).json('token not valid');
      } else {
        //checks token expiration time
        const d2 = new Date();
        if (d2.getTime() > userDoc[0].resetTime.getTime()) {
          return res.status(400).json('token not valid');
        } else {
          res.json(userDoc[0].name);
        }
      }
    })
    .catch((err) => {
      res.status(400).json('error');
    });
});

route.post('/reset', async (req, res) => {
  if (req.body.password.length < 8) {
    return res.status(400).json('password should be minimum 8 characters');
  } else {
    //hashing the password
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    userExists('name', req.body.username).then((userDoc) => {
      if (userDoc == null) {
        res.status(400).json('username not found');
      } else {
        let filter = {};
        filter['email'] = userDoc[0].email;
        Account.find(filter).then(async (accountDoc) => {
          if (accountDoc == null) {
            res.status(400).json('account not found');
          } else {
            let filter2 = {};
            filter2['password'] = req.body.password;
            await Account.findByIdAndUpdate(accountDoc[0]._id, filter2, {
              new: true,
            });
            userUpdate('reset', '', userDoc[0]._id);
            userUpdate('resetTime', '', userDoc[0]._id);
            res.json('password reset successful');
          }
        });
      }
    });
  }
});

route.post('/importuser', async (req, res) => {
  for (var values in req.body) {
    registerUser(req.body[values]);
  }
  res.status(200).json({ msg: 'all users inserted' });
});

route.get('/export', async (req, res) => {
  User.find()
    .select('-_id -__v -date')
    .then((assetDoc) => {
      res.status(200).send(assetDoc);
    });
});

module.exports = route;
