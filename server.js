const express = require('express');
const port = process.env.PORT;
const app = express(); 
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = process.env.MONGODB_ADDON_URI;

const insertDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('buttons');
  // Insert some documents
  collection.insertMany([
    {
      action : 'Message Slack',
      value: 'Hello World',
      icon: 'add',
      img: 'http://...',
      status: 'online'
    }
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log("Inserted 1 button");
    callback(result);
  });
};

const findDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('buttons');
  // Find some buttons
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

const router = express.Router(); 

router.route('/')
.all(function(req,res){ 
      res.json({message : "Bienvenue sur API Serli Button", methode : req.method});
});
  
// get all buttons  
router.route('/api/buttons')
.get(function(req,res){ 
	// Use connect method to connect to the server
  MongoClient.connect(url, function(err, db, res) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    
    findDocuments(db, function(docs, res) {
      res.json(docs);
      db.close();
    });
  });
})

// create new button
.post(function(req,res){
      var button = new Button();
      button.action = req.body.nom;
      button.value = req.body.adresse;
      button.icon = req.body.tel;
      button.img = req.body.description; 
      button.status = req.body.status; 
      button.save(function(err){
        if(err){
          res.send(err);
        }
        res.json({ message : 'INSERT OK' });
      }); 
});


// get button byId
router.route('/api/buttons/:buttonId')
.get(function(req,res){ 
  Button.findById(req.params.buttonId, function(err, button) {
    if (err)
        res.send(err);
    res.json(button);
  });
})

// update button byId
.put(function(req,res){ 
  Button.findById(req.params.buttonId, function(err, button) {
    if (err){
        res.send(err);
    }
    button.action = req.body.nom;
    button.value = req.body.adresse;
    button.icon = req.body.tel;
    button.img = req.body.description; 
    button.status = req.body.status;  
    button.save(function(err){
      if(err){
        res.send(err);
      }
      res.json({message : 'UPDATE OK'});
    });                
  });
})

// remove button byId
.delete(function(req,res){ 
  Button.remove({_id: req.params.buttonId}, function(err, button){
    if (err){
        res.send(err); 
    }
    res.json({message:"DELETE OK"}); 
  });     
});

app.use(router);

app.listen(port);