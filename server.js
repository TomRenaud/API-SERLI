const express = require('express');
const port = process.env.PORT;
const app = express(); 
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = process.env.MONGODB_ADDON_URI;

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db.close();
});

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
	Button.find(function(err, buttons){
        if (err){
            res.send(err); 
        }
        res.json(buttons);  
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