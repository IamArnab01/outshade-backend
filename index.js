const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");

// spinnig the express app
const app = express();
// dotenv config
dotenv.config();

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

app.listen(5000, () => console.log("App Runnig on port 5000"));
