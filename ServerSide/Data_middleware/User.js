const User = require('../models/User');

const userAdd = async (name, email, designation, role, status, empId) => {
  try {
    const user = new User({
      name,
      email,
      designation,
      role,
      status,
      empId,
    });
    return user.save();
  } catch (err) {
    return 'error';
  }
};

const userExists = async (type, value) => {
  try {
    let query = {};
    query[type] = value;
    return await User.findOne(query);
  } catch (err) {
    return 'error';
  }
};

const deleteAll = async () => {
  try {
    return User.deleteMany({});
  } catch (err) {
    return 'error';
  }
};

const userPaginate = async (type, limit, offset) => {
  try {
    return User.find({})
      .sort('status')
      .sort(type)
      .limit(limit)
      .skip(offset)
      .exec();
  } catch (err) {
    return 'error';
  }
};

const userCount = async () => {
  try {
    return User.countDocuments();
  } catch (err) {
    return 'error';
  }
};

const userUpdate = async (type, value, id) => {
  try {
    const filter = {};
    filter[type] = value;
    await User.findByIdAndUpdate(id, filter, { new: true });
    return;
  } catch (err) {
    console.log(err.message);
    return;
  }
};

module.exports = {
  userAdd,
  userExists,
  deleteAll,
  userPaginate,
  userCount,
  userUpdate,
};
