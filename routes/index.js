const express = require('express');
const router = express.Router();
const { connectToDB, ObjectId } = require('../utils/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET equipmwnts page */
router.get('/equipments', function(req, res, next) {
  res.render('equipments', { title: 'Equipments' });
});

/* GET add page */
router.get('/equipments/add', function(req, res, next) { 
  res.render('add', { title: 'Add Equipment' });
});


/* Handle the Form */
router.post('/rent_equipment', async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.highlight = req.body.highlight? true : false;
    console.log(req.body);
    let result = await db.collection("rent_equipments").insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

/* Display a detail equipment */
router.get('/equipments/detail/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("bookings").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.render('booking', { booking: result });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});


module.exports = router;
