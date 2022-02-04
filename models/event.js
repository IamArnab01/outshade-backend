const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    date: {
      type: String,
    },
    venue: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
