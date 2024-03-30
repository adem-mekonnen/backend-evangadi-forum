const jwt = require("jsonwebtoken");

const createToken = (username, id) => {
  const token = jwt.sign({ username, id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};

module.exports = {
  createToken,
};
