const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
const User = require("../models/user");
const Token = require("../models/token");
const privateRoute = require("../middlewares/privateRoute");

// dotenv config
dotenv.config();

router.post("/register", async (req, res) => {
  // hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // checking for already existing user
  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) {
    return res.status(400).send("User with the same email id already exists!");
  }

  // creating a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    const _user = await user.save();
    res.status(201).send(_user);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res, next) => {
  // getting user from db
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("User does not exist.");
  }
  const isPassValid = await bcrypt.compare(req.body.password, user.password);
  if (!isPassValid) {
    return res.status(400).send("Invalid password.");
  }
  // generating jwt token adding to auth header
  const token = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET_TOKEN
  );
  res.header("Bearer", token).send({ token: token, usre: user });
});

router.post("/password/reset", privateRoute, async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User does not exists!");
  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  let resetToken = crypto.randomBytes(32).toString("hex");
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(resetToken, salt);

  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  const link = {
    passwordResetLink: `${process.env.clientURL}/reset/password?token=${resetToken}&id=${user._id}`,
  };

  res.json(link);
});

router.post("/password/update", privateRoute, async (req, res, next) => {
  let passwordResetToken = await Token.findOne({ userId: req.body.userId });

  if (!passwordResetToken) {
    throw res.status(400).send("Invalid or expired token");
  }

  const isValid = await bcrypt.compare(
    req.body.token,
    passwordResetToken.token
  );

  if (!isValid) {
    throw res.status(400).send("Invalid or expired token");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);

  // updating user password
  await User.updateOne(
    { _id: req.body.userId },
    { $set: { password: hash } },
    { new: true }
  );

  // deleting token after update
  await passwordResetToken.deleteOne();

  res.status(200).send("Password Upadted Successfully");
});

module.exports = router;
