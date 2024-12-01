var express = require("express");
var router = express.Router();
var { authenticate } = require("../utils/auth");

const { connectToDB, ObjectId } = require("../utils/db");


// Specify booking being managed by a user
router.patch('/:id/manage', authenticate, async function (req, res) {
  const db = await connectToDB();
  try {
      console.log(req.params.id);
      console.log(req.body.rent_time);
      console.log(req.body.return_time);

      await db.collection("rent_equipments").updateOne(
        { _id: new ObjectId(req.params.id) },
        {
            $setOnInsert: {
                'user_id': [],
                'rent_time': [],
                'return_time': []
            }
        },
        { upsert: true }
    );


      let result = await db.collection("rent_equipments").updateOne({ _id: new ObjectId(req.params.id) },
          {
            $push: { 
              'user_id': new ObjectId(req.user._id), 
              'rent_time': new Date(req.body.rent_time),
              'return_time': new Date(req.body.return_time)
          }
          });

      if (result.modifiedCount > 0) {
          res.status(200).json({ message: "User updated" });
      } else {
          
          res.status(404).json({ message: "User not found" });
      }
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
  finally {
      await db.client.close();
  }
});

// get renter history
router.get('/:id/rent_history', async function (req, res) {
  const db = await connectToDB();
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 8;
    const skip = (page - 1) * perPage;

    const equipment = await db.collection("rent_equipments").findOne(
      { _id: new ObjectId(req.params.id) }
    );

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // Get all users involved in rentals
    const userIds = equipment.user_id.map(id => new ObjectId(id));
    const users = await db.collection("user").find(
      { _id: { $in: userIds } }
    ).toArray();

    // user IDs to names
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = {
        name: user.name
      };
    });

    // Combine the rental information
    const rentalHistory = equipment.user_id.map((userId, index) => ({
      userId: userId,
      userName: userMap[userId.toString()],
      rent_time: equipment.rent_time[index],
      return_time: equipment.return_time[index],
      rentalId: `${index}-${userId}`
    }));

    // Sort the array
    // rentalHistory.sort((a, b) => {
    //   if (sortField === 'userName') {
    //     return sortOrder * a.userName.localeCompare(b.userName);
    //   }
    //   return sortOrder * (new Date(a[sortField]) - new Date(b[sortField]));
    // });

    // Apply pagination
    const total = rentalHistory.length;
    const paginatedRentals = rentalHistory.slice(skip, skip + perPage);

    res.json({
      rentalHistory: paginatedRentals,
      total,
      page,
      perPage
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

//delete rent history user
router.delete('/:id/rental/:rentalId', async (req, res) => {
  const db = await connectToDB();
  try {
    const equipmentId = req.params.id;
    const rentalId = req.params.rentalId;
    
    // Extract the index from the rentalId (format: "index-userId")
    const rentalIndex = parseInt(rentalId.split('-')[0]);

    // Find the equipment
    const equipment = await db.collection("rent_equipments").findOne(
      { _id: new ObjectId(equipmentId) }
    );

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // Check if the index is valid
    if (rentalIndex < 0 || rentalIndex >= equipment.user_id.length) {
      return res.status(400).json({ message: "Invalid rental index" });
    }

    // Verify that the rental ID matches
    const expectedRentalId = `${rentalIndex}-${equipment.user_id[rentalIndex]}`;
    if (expectedRentalId !== rentalId) {
      return res.status(400).json({ message: "Invalid rental record" });
    }

    // Create new arrays excluding the element at the specified index
    const updatedUserIds = equipment.user_id.filter((_, index) => index !== rentalIndex);
    const updatedRentTimes = equipment.rent_time.filter((_, index) => index !== rentalIndex);
    const updatedReturnTimes = equipment.return_time.filter((_, index) => index !== rentalIndex);

    // Update the document with the new arrays
    await db.collection("rent_equipments").updateOne(
      { _id: new ObjectId(equipmentId) },
      {
        $set: {
          user_id: updatedUserIds,
          rent_time: updatedRentTimes,
          return_time: updatedReturnTimes
        }
      }
    );

    res.json({ message: "Rental record deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

//new user
router.post("/users", async function (req, res) {
  const db = await connectToDB();
  try {
    console.log(req.body);
    let result = await db.collection("user").insertOne(req.body);
    res.json({ users: result});
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

/* Retrieve a single user */
router.get("/users/:id", async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db
      .collection("user")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

//get all user
router.get("/users", async function (req, res) {
  const db = await connectToDB();
  try {
    let query = {};
    if (req.query.email) {
      query.email = { $regex: req.query.email };
    }
    let page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 10;
    let skip = (page - 1) * perPage;
    console.log(req.body);
    let result = await db
      .collection("user")
      .find(query)
      .skip(skip)
      .limit(perPage)
      .toArray();
    let total = await db.collection("user").countDocuments(query);

    res.json({ users: result, total: total, page: page, perPage: perPage});
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});



// Update a single user
router.put("/users/:id", async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.agree = req.body.agree ? true : false;
    console.log(req.body);

    delete req.body._id;
    let result = await db
      .collection("user")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

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
router.delete("/users/:id", async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db
      .collection("user")
      .deleteOne({ _id: new ObjectId(req.params.id) });
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



// routes
router.get("/", async function (req, res) {
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

    let result = await db
      .collection("rent_equipments")
      .find(query)
      .skip(skip)
      .limit(perPage)
      .toArray();
    let total = await db.collection("rent_equipments").countDocuments(query);

    res.json({
      equipments: result,
      total: total,
      page: page,
      perPage: perPage,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// New equipment
router.post("/", async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.highlight = req.body.highlight ? true : false;
    console.log(req.body);

    let result = await db.collection("rent_equipments").insertOne(req.body);

    
    res.json({ equipments: result});
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

/* Retrieve a single equipmwnt */
router.get("/:id", async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db
      .collection("rent_equipments")
      .findOne({ _id: new ObjectId(req.params.id) });
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
router.put("/:id", async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.highlight = req.body.highlight ? true : false;
    req.body.lastUpdated = new Date();
    console.log(req.body);

    delete req.body._id;
    let result = await db
      .collection("rent_equipments")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

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
router.delete("/:id", async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db
      .collection("rent_equipments")
      .deleteOne({ _id: new ObjectId(req.params.id) });
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
