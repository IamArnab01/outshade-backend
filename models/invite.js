const mongoose = require("mongoose");

const eventInviteSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
    },
    invitee: {
      type: String,
    },
    event: { type: Object },
    message: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
      enum: [true, false],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventInvitation", eventInviteSchema);
