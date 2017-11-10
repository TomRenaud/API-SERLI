const express = require('express');
const port = process.env.PORT;
const app = express(); 
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// DATABASE URL
const url = process.env.MONGODB_ADDON_URI;

// ADD BUTTON
const addButton = function(db, req, callback) {

  const collection = db.collection('buttons');
  
  collection.insertMany([
    {
      tag: req.body.tag,
      action : req.body.action,
      value: req.body.value,
      icon: req.body.icon,
      img: req.body.img,
      status: req.body.status
    }
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    callback(result);
  });
};

// FIND ALL BUTTONS
const findAllButtons = function(db, callback) {
  
  const collection = db.collection('buttons');
  
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    callback(docs);
  });
};

// FIND BUTTON
const findButtonByTag = function(db, req, callback) {
  
  const collection = db.collection('buttons');
  
  collection.find({'tag': req.params.buttonTagId}).toArray(function(err, docs) {
    assert.equal(err, null);
    callback(docs);
  });      
};

// UPDATE BUTTON 
const updateButton = function(db, req, callback) {
  
  const collection = db.collection('buttons');
  
  collection.updateOne({ tag : req.params.buttonTagId }
    , { $set: { 
          action : req.body.action,
          value: req.body.value,
          icon: req.body.icon,
          img: req.body.img,
          status: req.body.status 
        } 
      }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    callback(result);
  });  
};

// DELETE BUTTON
const removeButton = function(db, req, callback) {
  
  const collection = db.collection('buttons');
  
    collection.deleteOne({ tag : req.params.buttonTagId }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    callback(result);
  });    
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

const router = express.Router(); 

router.route('/')
.all(function(req,res){ 
      res.json({ message : "Bienvenue sur API Serli Button", methode : req.method });
})
  
router.route('/api/buttons')
.get(function(req,res){ 
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    // FIND ALL BUTTONS
    findAllButtons(db, function(buttons) {
      res.json(buttons);
      db.close();
    });
  });
})

.post(function(req,res){
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    // ADD BUTTON
    addButton(db, req, function(result) {
      res.json(result);
      db.close();
    });
  });
})

router.route('/api/buttons/:buttonTagId')
.get(function(req,res){ 
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    // FIND BUTTON BY TAG
    findButtonByTag(db, req, function(result) {
      res.json(result);
      db.close();
    });
  });
})

.put(function(req,res){ 
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    // UPDATE BUTTON BY TAG
    updateButton(db, req, function(result) {
      res.json(result);
      db.close();
    });
  });
})

.delete(function(req,res){ 
    MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    // REMOVE BUTTON BY TAG
    removeButton(db, req, function(result) {
      res.json(result);
      db.close();
    });
  });
});

app.use(router);

app.listen(port);