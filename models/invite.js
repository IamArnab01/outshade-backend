const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventInviteSchema = new mongoose.Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    invitee: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
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
