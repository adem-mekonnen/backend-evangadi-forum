const router = require("express").Router();

const {
  requestPasswordReset,
  resetPassword,
} = require("../controllers/resetController");

router.post("/", requestPasswordReset);
router.post("/reset/:token", resetPassword);

module.exports = router;
