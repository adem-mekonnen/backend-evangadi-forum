const db = require("../db/connect");
const { createToken } = require("../utils/jwt");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  const { username, firstname, lastname, email, password, phone } = req.body;
  try {
    if (!email || !password || !firstname || !lastname || !username) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "please enter all required fields" });
    }

    if (password.length < 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "password must be at least 8 characters" });
    }

    const [user] = await db.query(
      "select username,userid from users where username = ? or email =? ",
      [username, email]
    );

    if (user.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "you already have an account" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      "INSERT INTO users (username, firstname,lastname,email, password,phone) VALUES (?,?,?,?,?,?) ",
      [
        username,
        firstname,
        lastname,
        email,
        hashedPassword,
        phone ? phone : "0900000000",
      ]
    );

    const [registerdUser] = await db.query(
      "select username,userid from users where username = ? or email =? ",
      [username, email]
    );

    const token = createToken(
      registerdUser[0].username,
      registerdUser[0].userid
    );

    return res
      .status(StatusCodes.CREATED)
      .json({
        msg: "user created successfully",
        username: registerdUser[0].username,
        token,
      });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Some error occurred. Please try again" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "please enter all required fields" });
  }

  try {
    const [user] = await db.query(
      "select username,userid,password from users where email = ?  ",
      [email]
    );

    if (user.length < 1) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "invalid credential" });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "invalid credential" });
    }

    const token = createToken(user[0].username, user[0].userid);

    return res
      .status(StatusCodes.OK)
      .json({ msg: "login successful", username: user[0].username, token });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Some error occurred. Please try again" });
  }
};

const checkUser = async (req, res) => {
  const { username } = req.user;

  return res.status(StatusCodes.OK).json({ msg: "success", username });
};

module.exports = { register, login, checkUser };
