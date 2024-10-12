const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/equipments', function(req, res, next) {
  res.render('equipments', { title: 'Equipments' });
});

router.get('/equipments/add', function(req, res, next) { 
  res.render('add', { title: 'Add Equipment' });
});


module.exports = router;
