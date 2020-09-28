const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'Non Admin'],
  },
  designation: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  empId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Resigned'],
    required: true,
  },
  jira: {
    type: String,
  },
  reset: {
    type: String,
  },
  resetTime: {
    type: Date,
  },
});

module.exports = User = mongoose.model('User', UserSchema);
