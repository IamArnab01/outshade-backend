const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const inviteRoutes = require("./routes/invites");

// spinnig the express app
const app = express();
// dotenv config
dotenv.config();

const PORT = process.env.PORT || 8000;

// connecting to database
mongoose.connect(
  process.env.DATABASE_CONNECTION,
  {
    useNewUrlParser: true,
  },
  () => console.log("db connected")
);

// middlewares
app.use(cors());
app.use(express.json());

// route middlewares
app.use("/api", authRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/user", inviteRoutes);

app.listen(PORT, () => console.log("App Runnig on port 5000"));
