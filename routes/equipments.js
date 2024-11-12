var express = require('express');
var router = express.Router();

const { connectToDB, ObjectId } = require('../utils/db');

// routes
router.get('/', async function (req, res) {
    const db = await connectToDB();
    try {
        let query = {};
        if (req.query.name) {
            // query.email = req.query.email;
            query.name = { $regex: req.query.name };
        }
        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10;
        let skip = (page - 1) * perPage;

        let result = await db.collection("rent_equipments").find(query).skip(skip).limit(perPage).toArray();
        let total = await db.collection("rent_equipments").countDocuments(query);

        res.json({ equipments: result, total: total, page: page, perPage: perPage });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    finally {
        await db.client.close();
    }
});



// New Booking
router.post('/', async function (req, res) {
    const db = await connectToDB();
    try {
      req.body.highlight = req.body.highlight? true : false;
      console.log(req.body);
      await db.collection("rent_equipments").insertOne(req.body);
    } catch (err) {
      res.status(400).json({ message: err.message });
    } finally {
      await db.client.close();
    }
  });

  /* Retrieve a single equipmwnt */
router.get('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("rent_equipments").findOne({ _id: new ObjectId(req.params.id) });
        if (result) {
            res.json(result);   
        } else {
            res.status(404).json({ message: "Equipment not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Update a single equipmwnt
router.put('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        req.body.highlight = req.body.highlight ? true : false;
        req.body.lastUpdated = new Date();
        console.log(req.body);
        
        delete req.body._id;
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

// Delete a equipment
router.delete('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
      let result = await db.collection("rent_equipments").deleteOne({ _id: new ObjectId(req.params.id) });
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Equipment deleted" });
      } else {
        res.status(404).json({ message: "Equipment not found" });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    } finally {
      await db.client.close();
    }
  });

//new user
  router.post('/users', async function (req, res) {
    const db = await connectToDB();
    try {
      console.log(req.body);
      await db.collection("user").insertOne(req.body);
    } catch (err) {
      res.status(400).json({ message: err.message });
    } finally {
      await db.client.close();
    }
  });

  //get all user
  router.get('/users', async function (req, res) {
    const db = await connectToDB();
    try {
        let query = {};
        if (req.query.name) {
            //query.email = req.query.email;
            query.name = { $regex: req.query.name };
        }
        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10;
        let skip = (page - 1) * perPage;

        let result = await db.collection("user").find(query).skip(skip).limit(perPage).toArray();
        let total = await db.collection("user").countDocuments(query);

        res.json({ equipments: result, total: total, page: page, perPage: perPage });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    finally {
        await db.client.close();
    }
});

// Update a single user
router.put('users/:id', async function (req, res) {
  const db = await connectToDB();
  try {
      req.body.agree = req.body.agree ? true : false;
      console.log(req.body);
      
      delete req.body._id;
      let result = await db.collection("user").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

      if (result.modifiedCount > 0) {
          res.status(200).json({ message: "User updated" });
      } else {
          res.status(404).json({ message: "User not found" });
      }
  } catch (err) {
      res.status(400).json({ message: err.message });
  } finally {
      await db.client.close();
  }
});

// Delete a user
router.delete('users/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("user").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "User deleted" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

module.exports = router;