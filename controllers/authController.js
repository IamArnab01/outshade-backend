const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");
// dotenv config
dotenv.config();

exports.register = async (req, res) => {
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
};

exports.login = async (req, res, next) => {
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
  res.header("jwtToken", token).send({ token: token, usre: user });
};
