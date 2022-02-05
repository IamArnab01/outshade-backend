const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    owner: {
      type: String,
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
