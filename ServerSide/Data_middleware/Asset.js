const Asset = require('../models/Asset');
const User = require('../models/User');
//const { commentAdd } = require('../Data_middleware/Comment');

const assetSearch = async (type, value) => {
  try {
    let query = {};
    query[type] = value;
    return await Asset.findOne(query);
  } catch (err) {
    console.error('database search error');
    return 'error';
  }
};

const assetUserSearch = async (type, value) => {
  let query = {};
  query[type] = value;
  return User.findOne(query);
  // user.then(async (userdoc) => {
  //   console.log(userdoc);
  //   let query1 = {};
  //   query1['assetUser'] = userdoc._id;
  //   Asset.find(query1).then((assetDoc) => {
  //     console.log(assetDoc);
  //     return assetDoc;
  //   });
  // });
};

const assetCount = async (type, value, type1, value1) => {
  let query = {};
  query[value] = type;
  let query1 = {};
  query1[value1] = type1;
  return await Asset.countDocuments({ $and: [query, query1] });
};

const dataAssetAdd = async (assetObj, userId, name) => {
  try {
    let {
      assetTag,
      location,
      billNo,
      billLocation,
      billDate,
      assetType,
      status,
      comments,
      history = new Map(),
    } = assetObj;
    let comment;
    if (comments != undefined && comments != '') {
      comment = {
        name: name,
        date: new Date(),
        comments,
      };
    }
    let historys;
    if (history != undefined && history != '') {
      historys = {
        name: name,
        date: new Date(),
        history,
      };
    }
    const asset = new Asset({
      assetTag,
      assetType,
      billDate,
      location,
      billNo,
      status,
      billLocation,
      assetUser: userId,
      comments: comment,
      history: historys,
    });

    return await asset.save();
  } catch (err) {
    console.error(err.message);
    return 'error';
  }
};

const assetPopulate = (id, field) => {
  const user = Asset.findById(id).populate(field);
  return user;
};

const assetAllSearch = async () => {
  return await Asset.find();
};

const assetPaginate = (type, limit, offset) => {
  try {
    return Asset.find()
      .sort('status').sort(type)
      .limit(limit)
      .skip(offset)
      .exec();
  } catch (err) {
    return 'error';
  }
};

const assetUpdate = async (type, value, id) => {
  const filter = {};
  filter[type] = value;
  if (type == 'history') {
    console.log(type, value);
    await Asset.findByIdAndUpdate(id, {
      $push: { history: value },
    });
  } else {
    await Asset.findByIdAndUpdate(id, filter, { new: true });
  }
  return;
};

const assetDelete = async () => {
  try {
    return Asset.deleteMany({});
  } catch (err) {
    return 'error';
  }
};

module.exports = {
  assetSearch,
  assetUserSearch,
  assetCount,
  dataAssetAdd,
  assetAllSearch,
  assetPopulate,
  assetPaginate,
  assetUpdate,
  assetDelete,
};
