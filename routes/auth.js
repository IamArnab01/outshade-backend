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
    { _id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET_TOKEN,
    { expiresIn: "7d" }
  );
  res.header("Bearer", token).send({ token: token, user: user });
});

router.post("/password/reset", async (req, res, next) => {
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

  const resetData = {
    token: resetToken,
    user: user._id,
  };

  res.status(200).json(resetData);
});

router.post("/password/update", async (req, res, next) => {
  let passwordResetToken = await Token.findOne({ userId: req.body.userId });

  if (!passwordResetToken) {
    return res.status(400).send("Invalid or expired token");
  }

  const isValid = await bcrypt.compare(
    req.body.token,
    passwordResetToken.token
  );

  if (!isValid) {
    return res.status(400).send("Invalid or expired token");
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

// change password route
router.patch("/password/change", privateRoute, async (req, res, next) => {
  const { oldPassword, newPassword, userId } = req.body;
  const user = await User.findOne({ _id: userId });

  const isPassValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPassValid) {
    return res.status(400).send("Invalid input");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  // changing user password
  try {
    await User.findOneAndUpdate(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
    res.status(200).send("Password Changed Successfully");
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
