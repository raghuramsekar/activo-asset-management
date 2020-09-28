const express = require('express');
const route = express.Router();
const { check, validationResult } = require('express-validator');
const {
  assetAdd,
  assetToStore,
  assetReassign,
} = require('../../Controller_middleware/asset');
const {
  assetCount,
  assetSearch,
  assetPaginate,
  assetUpdate,
  assetDelete,
  assetUserSearch,
} = require('../../Data_middleware/Asset');
const { userExists } = require('../../Data_middleware/User');
const auth = require('../../Controller_middleware/auth');
const Asset = require('../../models/Asset');
const paginate = require('express-paginate');
const User = require('../../models/User');
const nodemailer = require('nodemailer');
const Mail = require('../../Controller_middleware/mail');

//@route   post api/asset/new
//@desc    add asset
//@access  private
route.post(
  '/new',
  auth,
  [
    check('assetTag', 'please include asset tag').not().isEmpty(),
    check('location', 'please include location').not().isEmpty(),
    check('billNo', 'please include bill no').not().isEmpty(),
    check('billLocation', 'please include bill location').not().isEmpty(),
    check('billDate', 'please include bill date').not().isEmpty(),
    check('assetType', 'please include asset type').not().isEmpty(),
    check('status', 'please include status').not().isEmpty(),
  ],
  async (req, res) => {
    console.log(req.body);
    try {
      console.log('hit achieved');
      req.body.billDate = new Date(req.body.billDate);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('server error');
        return res.status(400).json({ errors: errors.array() });
      }
      let user;
      if (req.body.status == 'Assigned') {
        if (req.body.empId != undefined) {
          user = userExists('empId', req.body.empId);
        } else {
          res.status(401).json('check entered emp id');
        }
      } else {
        user = userExists('name', 'store');
      }
      user.then((userDoc) => {
        if (userDoc == null)
          return res.status(409).json({ msg: 'user not exists' });
        else {
          const assetCheck = assetSearch('assetTag', req.body.assetTag);
          assetCheck
            .then((assetCheckdoc) => {
              if (assetCheckdoc) {
                return res.status(400).json({ msg: 'asset already exists' });
              } else {
                const asset = assetAdd(req.body, userDoc._id, req.user.name);

                asset
                  .then(async (assetDoc) => {
                    console.log('for mailing');
                    Mail(
                      assetDoc.assetTag,
                      userDoc.empId,
                      userDoc.name,
                      userDoc.email
                    );
                    res.json({
                      msg: assetDoc,
                    });
                  })
                  .catch((err) => {
                    console.log(err.message);
                    return res.status(400).json({ msg: 'asset not added1' });
                  });
              }
            })
            .catch((err) => {
              console.error(err.message);
              return res.status(400).json({ msg: 'asset not added2' });
            });
        }
      });
    } catch (err) {
      console.error('Asset not added');
      res.status(400).json({ msg: 'Asset not added' });
    }
  }
);

//@route   get api/asset/assetdashboard
//@desc    lists all asset count
//@access  private
route.get('/assetsearchspecific', auth, (req, res) => {
  try {
    const asset = req.query.asset;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    let query1 = {};
    let query = {};
    let paginated = '';
    query['assetType'] = asset;
    console.log(req.query.state);
    if (req.query.state != undefined) {
      let state = req.query.state;
      if (state == 'Available') state = 'InStore';
      query1['status'] = state;
      paginated = Asset.find({ $and: [query, query1] })
        .sort('status')
        .sort('assetTag')
        .limit(limit)
        .skip(offset)
        .exec();
    } else {
      paginated = Asset.find(query)
        .sort('status')
        .sort('assetTag')
        .limit(limit)
        .skip(offset)
        .exec();
    }

    paginated.then(async (assetDoc) => {
      const row = [];
      const count = assetCount();

      count.then(async (countData) => {
        let pageCount = (countData - req.query.offset) / req.query.limit;
        if (typeof pageCount != 'number' || pageCount < 1) pageCount = 0;
        assetDoc.map(async (assetDocData) => {
          const data = await Asset.findById(assetDocData._id).populate(
            'assetUser'
          );
          row.push(data);
          if (row.length == assetDoc.length) {
            res.json({
              hasMore: paginate.hasNextPages(req)(pageCount),
              data: row,
            });
          }
        });
      });
    });
  } catch (err) {
    console.log(err.message);
    res.status(503).json({ msg: 'server error' });
  }
});

//@route   get api/asset/assetdashboard
//@desc    lists all asset count
//@access  private
route.get('/assetdashboard', auth, (req, res) => {
  try {
    const laptopAvailableCount = assetCount(
      'Laptop',
      'assetType',
      'InStore',
      'status'
    );
    laptopAvailableCount.then((laptopAvailableCountDoc) => {
      const laptopAssignedCount = assetCount(
        'Laptop',
        'assetType',
        'Assigned',
        'status'
      );
      laptopAssignedCount.then((laptopAssignedCountDoc) => {
        const desktopAvailableCount = assetCount(
          'Desktop',
          'assetType',
          'InStore',
          'status'
        );
        desktopAvailableCount.then((desktopAvailableCountDoc) => {
          const desktopAssignedCount = assetCount(
            'Desktop',
            'assetType',
            'Assigned',
            'status'
          );
          desktopAssignedCount.then((desktopAssignedCountDoc) => {
            const mouseAvailableCount = assetCount(
              'Mouse',
              'assetType',
              'InStore',
              'status'
            );
            mouseAvailableCount.then((mouseAvailableCountDoc) => {
              const mouseAssignedCount = assetCount(
                'Mouse',
                'assetType',
                'Assigned',
                'status'
              );
              mouseAssignedCount.then((mouseAssignedCountDoc) => {
                const keyboardAvailableCount = assetCount(
                  'Keyboard',
                  'assetType',
                  'InStore',
                  'status'
                );
                keyboardAvailableCount.then((keyboardAvailableCountDoc) => {
                  const keyboardAssignedCount = assetCount(
                    'Keyboard',
                    'assetType',
                    'Assigned',
                    'status'
                  );
                  keyboardAssignedCount.then((keyboardAssignedCountDoc) => {
                    const ramAvailableCount = assetCount(
                      'Ram',
                      'assetType',
                      'InStore',
                      'status'
                    );
                    ramAvailableCount.then((ramAvailableCountDoc) => {
                      const ramAssignedCount = assetCount(
                        'Ram',
                        'assetType',
                        'Assigned',
                        'status'
                      );
                      ramAssignedCount.then((ramAssignedCountDoc) => {
                        res.json({
                          msg: {
                            Laptop: {
                              Available: laptopAvailableCountDoc,
                              Assigned: laptopAssignedCountDoc,
                            },
                            Desktop: {
                              Available: desktopAvailableCountDoc,
                              Assigned: desktopAssignedCountDoc,
                            },
                            Mouse: {
                              Available: mouseAvailableCountDoc,
                              Assigned: mouseAssignedCountDoc,
                            },
                            Keyboard: {
                              Available: keyboardAvailableCountDoc,
                              Assigned: keyboardAssignedCountDoc,
                            },
                            Ram: {
                              Available: ramAvailableCountDoc,
                              Assigned: ramAssignedCountDoc,
                            },
                          },
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  } catch (err) {
    res.status(503).json({ msg: 'server error' });
  }
});

//@route   get api/asset/allassets
//@desc    all assets
//@access  private
route.get('/allassets', auth, async (req, res) => {
  try {
    const asset = assetPaginate(
      'assetTag',
      parseInt(req.query.limit),
      parseInt(req.query.offset)
    );
    asset.then(async (assetDoc) => {
      console.log(assetDoc);
      const row = [];
      const count = assetCount();
      count.then(async (countData) => {
        let pageCount = (countData - req.query.offset) / req.query.limit;
        if (typeof pageCount != 'number' || pageCount < 1) pageCount = 0;
        assetDoc.map(async (assetDocData) => {
          const data = await Asset.findById(assetDocData._id).populate(
            'assetUser'
          );
          row.push(data);
          if (row.length == assetDoc.length) {
            res.json({
              hasMore: paginate.hasNextPages(req)(pageCount),
              data: row,
            });
          }
        });
      });
    });
  } catch (err) {
    res.status(503).json({ msg: 'server error' });
  }
});

//@route   delete api/asset/delete
//@desc    delete all assets
//@access  private
route.delete('/delete', auth, (req, res) => {
  const asset = assetDelete();
  asset
    .then(() => {
      res.json({ msg: 'datas deleted' });
    })
    .catch((err) => {
      res.status(400).json({ msg: 'server error' });
    });
});

//@route   get api/asset/search
//@desc    search asset
//@access  private
route.get('/search', auth, async (req, res) => {
  const search = req.query.search;
  console.log(search);
  const asset = assetSearch('assetTag', search);
  asset
    .then(async (assetdoc) => {
      if (assetdoc == null)
        return res.status(401).json('asset search incompleted');
      else {
        const populatedassetdoc = await Asset.findById(assetdoc._id).populate(
          'assetUser'
        );
        res.json({ hasMore: false, data: [populatedassetdoc] });
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.status(401).json('asset search incompleted');
    });
});

//@route   post api/asset/assetupdate
//@desc    update asset details
//@access  private
route.post('/assetupdate', auth, async (req, res, next) => {
  let {
    assetTag,
    assetType,
    status,
    empId,
    billNo,
    billDate,
    location,
    comments,
  } = req.body;
  let historys = new Map();
  const asset = assetSearch('assetTag', assetTag);
  asset.then((assetDoc) => {
    // console.log();
    if (assetType != assetDoc.assetType) {
      assetUpdate('assetType', assetType, assetDoc._id);
      historys.set('assetType', assetType);
    }
    if (billNo != assetDoc.billNo) {
      assetUpdate('billNo', billNo, assetDoc._id);
      historys.set('billNo', billNo);
    }
    // if (billDate != assetDoc.billDate) {
    //   assetUpdate('billDate', billDate, assetDoc._id);
    //   historys['billDate'] = billDate;
    // }
    if (location != assetDoc.location) {
      assetUpdate('location', location, assetDoc._id);
      historys.set('location', location);
    }
    if (comments != 'undefined') {
      comments = {
        name: req.user.name,
        comments: comments,
        date: new Date(),
      };
      assetUpdate('comments', comments, assetDoc._id);
    }
    if (status == 'InStore' || status == 'Scrape') {
      let query = {};
      query['name'] = 'store';
      User.find(query).then((userDoc) => {
        console.log(userDoc[0]);
        if (assetDoc.assetUser.toString() != userDoc[0]._id.toString()) {
          historys.set('status', status);
          historys.set('empId', userDoc[0].empId);
          const history = {
            history: historys,
            name: req.user.name,
            date: new Date(),
          };
          assetUpdate('history', history, assetDoc._id);
          assetUpdate('assetUser', userDoc[0]._id, assetDoc._id);

          assetUpdate('status', status, assetDoc._id).then(() => {
            res.json('success');
          });
          Mail(
            assetDoc.assetTag,
            userDoc[0].empId,
            userDoc[0].name,
            userDoc[0].email
          );
        } else {
          console.log(historys.size);
          if (historys.size != 0) {
            const history = {
              history: historys,
              name: req.user.name,
              date: new Date(),
            };
            assetUpdate('history', history, assetDoc._id);
          }
          res.json('success');
        }
      });
    } else if (status == 'Assigned') {
      if (empId != undefined) {
        let query = {};
        query['empId'] = empId;
        User.find(query).then((userDoc) => {
          if (userDoc != null) {
            console.log(userDoc);
            if (assetDoc.assetUser.toString() != userDoc[0]._id.toString()) {
              historys.set('status', 'Assigned');
              historys.set('empId', userDoc[0].empId);
              const history = {
                history: historys,
                name: req.user.name,
                date: new Date(),
              };
              assetUpdate('history', history, assetDoc._id);
              assetUpdate('assetUser', userDoc[0]._id, assetDoc._id);

              assetUpdate('status', 'Assigned', assetDoc._id).then(
                (assetDoc) => {
                  res.json('success');
                }
              );
              Mail(
                assetDoc.assetTag,
                userDoc[0].empId,
                userDoc[0].name,
                userDoc[0].email
              );
            } else {
              console.log(historys.size);
              if (historys.size != 0) {
                const history = {
                  history: historys,
                  name: req.user.name,
                  date: new Date(),
                };
                assetUpdate('history', history, assetDoc._id);
              }
              res.json('success');
            }
            // if(history.size == 0)
          } else {
            res.status(401).json('please check entered employee id');
          }
        });
      }
    } else {
      res.status(401).json('please check entered employee id');
    }
  });
});

route.get('/usersearch', auth, async (req, res) => {
  const empId = req.query.search;
  console.log(empId);
  const user = assetUserSearch('empId', empId);
  user.then((assetdoc) => {
    let query = {};
    query['assetUser'] = assetdoc._id;
    Asset.find(query).then((userdoc) => res.json({ msg: userdoc }));
  });
});

route.get('/comments', auth, async (req, res) => {
  console.log('hits achieved');
  if (req.query.search) {
    const search = req.query.search;
    let query = {};
    query['assetTag'] = search;
    const comments = Asset.find(query).select('comments');
    comments.then((commentsDoc) => {
      console.log(commentsDoc[0].comments[0]);
      // for (var values in commentsDoc[0].comments[0]) {
      //   const key = commentsDoc[0].comments[0];
      //   console.log(key[values]);
      // }
      if (commentsDoc != null) res.json({ msg: [commentsDoc[0].comments[0]] });
      else res.json({ msg: 'oosp' });
    });
  } else {
    console.log('oops');
    res.status(200).json({ msg: [] });
  }
});

route.post('/test', (req, res) => {
  for (var values in req.body) {
    console.log(req.body[values]);
  }
  return res.status(200).json({ oops: 'oops' });
});

var fs = require('fs');

route.post('/test1', function (req, res) {
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
    console.log('Uploading: ' + filename);
    fstream = fs.createWriteStream(__dirname + '/files/' + filename);
    file.pipe(fstream);
    fstream.on('close', function () {
      res.redirect('back');
    });
  });
});

route.get('/export', auth, async (req, res) => {
  const asset = Asset.find().select('-_id -__v ');
  asset.then((assetdoc) => res.status(200).send(assetdoc));
});

route.post('/importuser', async (req, res) => {
  for (var values in req.body) {
    let user = null;
    if (req.body[values].status == 'Assigned') {
      if (req.body[values].empId != undefined) {
        user = userExists('empId', req.body[values].empId);
      } else {
        res.status(401).json('check entered emp id');
      }
    } else {
      user = userExists('name', 'store');
    }
    user.then((userDoc) => {
      if (userDoc != null) {
        assetAdd(req.body[values], userDoc._id);
      } else {
        res.status(400).json({ msg: 'user not available' });
      }
    });
  }
  res.status(200).json({ msg: 'all users inserted' });
});

route.get('/history', auth, async (req, res) => {
  if (req.query.search) {
    const search = req.query.search;
    let query = {};
    query['assetTag'] = search;
    const history = Asset.find(query).select('history');
    history.then((historyDoc) => {
      res.json({ msg: historyDoc[0].history });
    });
  } else {
    res.status(200).json({ msg: [] });
  }
});

module.exports = route;
