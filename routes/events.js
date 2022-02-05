const router = require("express").Router();
const Event = require("../models/event");
const privateRoute = require("../middlewares/privateRoute");
const APIFeatures = require("../utils/apiFeatures");

router.post("/create", privateRoute, async (req, res) => {
  console.log(req.body);
  const event = new Event({
    owner: req.body.owner,
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    venue: req.body.venue,
  });

  try {
    const _event = await event.save();
    // console.log(_event);
    res.status(201).send(_event);
  } catch (err) {
    res.status(400).send(err);
  }
});

// get all events
router.get("/getAll", privateRoute, async (req, res) => {
  const featuredData = new APIFeatures(Event, req.query)
    .filter()
    .sort()
    .paginate();

  try {
    const data = await featuredData.query;
    res.status(200).json({
      status: 200,
      results: data.length,
      data,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

// get individual users created event
router.get("/getAll/:userId", privateRoute, async (req, res) => {
  try {
    const allEvents = await Event.find({
      owner: req.params.userId,
    });
    res.status(200).send(allEvents);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
