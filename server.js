const express = require('express');
const port = process.env.PORT;
const app = express(); 
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const connect = require('connect'); 
const request = require('request');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// DATABASE URL
const url = process.env.MONGODB_ADDON_URI;

// ADD BUTTON
const addButton = function(db, req, callback) {

  const collection = db.collection('buttons');

  console.log('req',req.body.tag);
  
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

// CALL BUTTON
const callButton = function(db, req, callback) {

  const collection = db.collection('buttons');

  collection.find({'tag': req.params.buttonTagId}).toArray(function(err, docs) {
    assert.equal(err, null);
    callback(docs);
  });  
}

// UPDATE BUTTON 
const updateButton = function(db, req, callback) {
  
  const collection = db.collection('buttons');
  
  collection.updateOne({ tag : req.params.buttonTagId }
    , { $set: {
          tag: req.body.tag,
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

// SEND MESSAGE TO SLACK
const sendMessageToSlack = function(button) {
  request.post({
      url:'https://hooks.slack.com/services/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',
      body: JSON.stringify({
        "text" : button[0].value,
        "username" : "SERLI BUTTON",
        "icon_emoji" : ":ghost:"
      }),
      }, 
      function(error, response, body){
      if(error){
        console.log(error);
      }
      console.log(body);
  });
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

const router = express.Router(); 

router.route('/')
.all(function(req,res){ 
      res.json({ message : "API Serli Button" });
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

router.route('/api/button/:buttonTagId')
.get(function(req,res){ 
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    // EXECUTE BUTTON ACTION 
    callButton(db, req, function(result) {
      console.log(result[0].action);
      switch (result[0].action) {
        case 'Message Slack':
          sendMessageToSlack(result);
          break;
        default:
          sendMessageToSlack(result);
          break;
      }
      db.close();
    });
  });
})

app.use(router);

app.listen(port);