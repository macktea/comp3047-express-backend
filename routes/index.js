const express = require('express');
const router = express.Router();
const { connectToDB, ObjectId } = require('../utils/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET equipmwnts page */
router.get('/equipments', async function(req, res) {
  const db = await connectToDB();
  try {
    let results = await db.collection("rent_equipments").find().toArray();
    res.render('equipments', { equipments: results });
    console.log(results);
  } catch (err) {
      res.status(400).json({ message: err.message });
  } finally {
      await db.client.close();
  }
});


/* GET add page */
router.get('/equipments/add', function(req, res, next) { 
  res.render('add', { title: 'Add Equipment' });
});


// get all equipments ??
router.get('/rent_equipment', async function (req, res) {
  const db = await connectToDB();
  try {
    let results = await db.collection("rent_equipments").find().toArray();
    res.json(results);
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
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



/* Display a detail equipment page*/
router.get('/equipment/detail/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("rent_equipments").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.render('detail', { equipments: result });
    } else {
      res.status(404).json({ message: "Equipment not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// Delete a equipment
// router.post('/booking/delete/:id', async function (req, res) {
//   const db = await connectToDB();
//   try {
//     let result = await db.collection("bookings").deleteOne({ _id: new ObjectId(req.params.id) });
//     if (result.deletedCount > 0) {
//       res.status(200).json({ message: "Booking deleted" });
//     } else {
//       res.status(404).json({ message: "Booking not found" });
//     }
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   } finally {
//     await db.client.close();
//   }
// });


//get the edit page
router.get('/equipment/edit/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("rent_equipments").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.render('edit', { equipments: result });
    } else {
      res.status(404).json({ message: "Equipment not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// display the update form
router.get('/booking/update/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("bookings").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.render('update', { booking: result });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// Update a single Booking
router.post('/rent_equipment/update/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.highlight = req.body.highlight? true : false;
    console.log(req.body);
    let result = await db.collection("rent_equipments").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Equipment updated" });
    } else {
      res.status(404).json({ message: "Equipment not found" });
    }

  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});


module.exports = router;
