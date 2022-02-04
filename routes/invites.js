const router = require("express").Router();
const EventInvitation = require("../models/invite");
const Event = require("../models/event");
const privateRoute = require("../middlewares/privateRoute");

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
router.get("/invitation/list/:userId", async (req, res) => {
  try {
    const myAllInvitations = await EventInvitation.find({
      invitee: req.params.userId,
    });
    // if user doesnot have any invitation
    if (!myAllInvitations) res.json("No invitation found for the user.");
    res.status(200).send(myAllInvitations);
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
