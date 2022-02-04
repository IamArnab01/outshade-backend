const router = require("express").Router();
const Event = require("../models/event");
const privateRoute = require("../middlewares/privateRoute");

router.post("/create", privateRoute, async (req, res) => {
  const event = new Event({
    owner: req.body.userId,
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    venue: req.body.venue,
  });

  try {
    const _event = await event.save();
    res.status(201).send(_event);
  } catch (err) {
    res.status(400).send(err);
  }
});

// get all events
router.get("/getAll", privateRoute, async (req, res) => {
  try {
    const allEvents = await Event.find();
    res.status(200).send(allEvents);
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
