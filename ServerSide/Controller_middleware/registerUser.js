const bcrypt = require('bcryptjs');
const { userAdd } = require('../Data_middleware/User.js');
const { accountAdd } = require('../Data_middleware/Account');

async function registerUser(userObject) {
  try {
    let {
      name,
      email,
      designation = '',
      password,
      role,
      status,
      empId,
      jira = '',
    } = userObject;

    //hash the password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    console.log('password hashed');

    //user addition
    let user = userAdd(name, email, designation, role, status, empId, jira);
    user.then((userDoc) => {
      //Account addition
      const account = accountAdd(email, password, role, userDoc._id);
    });
    return user;
  } catch (err) {
    console.error('user and account creation error');
    throw 'error2';
  }
}

module.exports = registerUser;
