const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const auth = async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Authentication invalid" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const { username, id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { username, id };
    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "fikad invalid" });
  }
};

module.exports = auth;
