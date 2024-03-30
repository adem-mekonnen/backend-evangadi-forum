const express = require("express");
const { login, register, checkUser } = require("../controllers/userCont");

const authMiddleware = require("../middleware/authentication");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/check", authMiddleware, checkUser);

module.exports = router;
