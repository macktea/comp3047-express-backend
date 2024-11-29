const express = require('express');
const router = express.Router();
const { connectToDB, ObjectId } = require('../utils/db');
const { generateToken, extractToken, removeToken, verifyToken } = require('../utils/auth');



router.get('/test', verifyToken, function (req, res, next) {
  console.log(req.user)
  res.send('respond with a resource');
});

//login function
router.post('/api/login', async function (req, res) {
  const db = await connectToDB();
  try {
    // check if the user exists
    var user = await db.collection("user").findOne({ email: req.body.email });
    console.log(req.body);
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

   // res.json(user);

// return a JWT token
    res.json({ token: await generateToken(user) });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});





/* GET home page. */
router.get('/', async function(req, res, next) {
  const db = await connectToDB();
  try {
    let results = await db.collection("rent_equipments").find({ highlight: true }).toArray();
    console.log(results);
    res.render('index', { equipments: results });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});


/* GET equipmwnts page */
router.get('/equipments', async function(req, res) {
  const db = await connectToDB();
  try {
    let results = await db.collection("rent_equipments").find().toArray();
    
    // Calculate time difference
    results = results.map(equipment => {
      if (equipment.lastUpdated) {
        const now = new Date();
        const diffMs = now - new Date(equipment.lastUpdated);
        const diffMins = Math.round(diffMs / 60000);
        equipment.lastUpdatedText = `Last updated: ${diffMins} mins ago`;
      } else {
        equipment.lastUpdatedText = null;
      }
      return equipment;
    });

    res.render('equipments', { equipments: results });
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


// get equipments
router.get('/rent_equipment', async function (req, res) {
  const db = await connectToDB();
  try {
    let results = await db.collection("rent_equipments").find().toArray();
    redirect('/equipments');
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
    res.redirect('/equipments');
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
router.post('/equipment/delete/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("rent_equipments").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount > 0) {
      redirect('/equipments');
    } else {
      res.status(404).json({ message: "Equipment not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});


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
router.get('/equipment/update/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    
    let result = await db.collection("rent_equipments").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.render('edit', { equipments: result });
    } else {
      res.status(404).json({ message: "equipments not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// Update a single Booking
router.post('/equipment/update/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.highlight = req.body.highlight ? true : false;
    req.body.lastUpdated = new Date();
    console.log(req.body);
    let result = await db.collection("rent_equipments").updateOne(
      { _id: new ObjectId(req.params.id) }, 
      { $set: req.body }
    );

    if (result.modifiedCount > 0) {
      redirect('/equipments');
    } else {
      res.status(404).json({ message: "Equipment not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

router.post('/api/logout', async function (req, res) {
  const token = extractToken(req);

  if (!token) {
      return res.status(400).json({ message: "Bad Request: No token provided" }); // Handle missing token
  }

  try {
      await removeToken(token); // Attempt to remove the token
      res.status(204).send(); // No content response for successful logout
  } catch (err) {
      console.error("Error during logout:", err); // Log any errors
      res.status(500).json({ message: "Internal Server Error" }); // Handle server errors
  }
});




module.exports = router;
