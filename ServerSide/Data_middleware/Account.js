const Account = require('../models/Account');

const accountInfo = async (type, value) => {
  try {
    let query = {};
    query[type] = value;
    return await Account.findOne(query);
  } catch (err) {
    console.error('user doesnot exists');
    return 'error';
  }
};

const accountAdd = async (email, password, role, userId) => {
  const accountdoc = new Account({
    email,
    password,
    userId,
    role,
  });

  return await accountdoc.save();
};

module.exports = {
  accountAdd,
  accountInfo,
};
