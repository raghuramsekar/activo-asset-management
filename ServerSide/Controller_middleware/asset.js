const { assetSearch } = require('../Data_middleware/Asset');
const { userExists } = require('../Data_middleware/User');
const { dataAssetAdd } = require('../Data_middleware/Asset');
const Asset = require('../models/Asset');

const assetToStore = async (info) => {
  let { assetTag, comments } = info;
  const asset = assetSearch('assetTag', assetTag);
  asset.then(async (assetdoc) => {
    if (assetdoc == 'error') return 'error';
    else {
      const filter = { assetUser: null };
      await Asset.findByIdAndUpdate(assetdoc._id, filter);
      if (comments != 'undefined') {
        await Asset.findByIdAndUpdate(assetdoc._id, {
          $push: { comments: comments },
        });
      }
    }
  });
  return asset;
};

const assetReassign = async (info, userId) => {
  let { comments, assetTag } = info;
  const asset = assetSearch('assetTag', assetTag);
  asset.then(async (assetdoc) => {
    if (assetdoc == 'error') return 'error';
    else {
      const filter = { assetUser: userId };
      console.log(assetdoc._id);
      const change = await Asset.findByIdAndUpdate(assetdoc._id, filter, {
        new: true,
      });
      console.log(change);
      if (comments != 'undefined') {
        await Asset.findByIdAndUpdate(assetdoc._id, {
          $push: { comments: comments },
        });
      }
    }
  });
  return asset;
};

const assetAdd = async (assetObj, empid, name) => {
  try {
    const asset = dataAssetAdd(assetObj, empid, name);
    return asset;
  } catch (err) {
    console.error('asset add');
    return 'error';
  }
};

module.exports = {
  assetToStore,
  assetReassign,
  assetAdd,
};
