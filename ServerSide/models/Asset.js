const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: String,
  },
  comment: {
    type: String,
  },
});

const comments = mongoose.model('comments', commentSchema);

const Assetschema = new mongoose.Schema({
  assetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assetType: {
    type: String,
    enum: ['Laptop', 'Desktop', 'Keyboard', 'Mouse', 'Ram'],
    required: true,
  },
  assetTag: {
    type: String,
    required: true,
  },
  billDate: {
    type: Date,
    required: true,
  },
  billNo: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Assigned', 'Scrape', 'InStore'],
    required: true,
  },
  location: {
    type: Number,
    required: true,
    enum: [108, 401],
  },
  comments: [
    {
      name: { type: String },
      date: { type: Date },
      comments: { type: String },
    },
  ],
  history: [
    {
      name: { type: String },
      date: { type: Date },
      history: { type: Map },
    },
  ],
  core: {
    type: String,
  },
  ram: {
    type: String,
  },
  hardDisk: {
    type: String,
  },
  os: {
    type: String,
    enum: ['Windows 10', 'Linux', 'Windows 8.1'],
  },
});

module.exports = Asset = mongoose.model('Asset', Assetschema);
