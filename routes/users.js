const express = require('express');
const router = express.Router();
const { connectToDB, ObjectId } = require('../utils/db');

router.get('/', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("user").aggregate([
      {
        $lookup: {
          from: "rent_equipments",
          localField: "_id",
          foreignField: "manager",
          as: "equipment"
        }
      },
      // remove the password and tokens fields
      { $project: { password: 0, tokens: 0 } }
    ]).toArray();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  finally {
    await db.client.close();
  }
});

module.exports = router;
