const router = require("express").Router();
const EventInvitation = require("../models/invite");
const Event = require("../models/event");
const privateRoute = require("../middlewares/privateRoute");
const APIFeatures = require("../utils/apiFeatures");

router.post("/invite/:eventId", privateRoute, async (req, res) => {
  const event = await Event.findById({
    _id: req.params.eventId,
  });

  const new_event = {
    id: event._id,
    owner: event.owner,
    title: event.title,
    description: event.description,
    date: event.date,
    venue: event.venue,
  };

  const event_invitation = new EventInvitation({
    sender: req.body.senderId,
    invitee: req.body.inviteeId,
    message: req.body.message,
    event: new_event,
    status: req.body.status,
  });

  try {
    const invitation = await event_invitation.save();
    res.status(201).send(invitation);
  } catch (err) {
    res.status(400).send(err);
  }
});

// get individual users invitation list
// filter() query ->
// api?invitee = user_id -> this for all the invites the logged in user got by other users
// api?sender = user_id -> this for all the invites the made by the logged in user for other users
router.get("/invitation/list", async (req, res) => {
  const featuredData = new APIFeatures(EventInvitation, req.query)
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

// updating my(logged in user's) invitation status -> accepted(false)/rejected(false)/pending(true)
router.patch("/invititaion/:inviteId", privateRoute, async (req, res) => {
  try {
    const updatedInvite = await EventInvitation.findOneAndUpdate(
      {
        _id: req.params.inviteId,
      },
      {
        $set: {
          message: req.body.message,
          status: req.body.status,
        },
      },
      { new: true }
    );
    res.status(200).json({ message: req.body.message, updatedInvite });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
