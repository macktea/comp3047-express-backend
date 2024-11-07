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
        let total = await db.collection("rent_qeuipments").countDocuments(query);

        res.json({ equipments: result, total: total, page: page, perPage: perPage });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    finally {
        await db.client.close();
    }
});

// New Booking
router.post('/rent_equipment', async function (req, res) {
    const db = await connectToDB();
    try {
      req.body.highlight = req.body.highlight? true : false;
    
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



module.exports = router;