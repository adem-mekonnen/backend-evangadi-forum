const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const { sendPasswordResetEmail } = require("./resetPassword");

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Implement additional validation if necessary (e.g., check email format)

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = new Date(Date.now() + 3600000); // Token valid for 1 hour

    const updateUserQuery = `
      UPDATE users
      SET resetToken = ?, resetTokenExpiration = ?
      WHERE email = ?;
    `;

    const updateResult = await pool.query(updateUserQuery, [
      resetToken,
      resetTokenExpiration,
      email,
    ]);

    if (updateResult.affectedRows === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    await sendPasswordResetEmail(email, resetToken);

    return res
      .status(StatusCodes.OK)
      .json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An error occurred while processing your request" });
  }
};

exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    if (!newPassword) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "New password is required" });
    }

    const user = await getUserByResetToken(resetToken);

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateUserQuery = `
      UPDATE users
      SET password = ?, resetToken = NULL, resetTokenExpiration = NULL
      WHERE resetToken = ?;
    `;

    await pool.query(updateUserQuery, [hashedPassword, resetToken]);

    return res
      .status(StatusCodes.OK)
      .json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An error occurred while processing your request" });
  }
};

async function getUserByResetToken(resetToken) {
  const getUserQuery = `
    SELECT * FROM users
    WHERE resetToken = ? AND resetTokenExpiration > NOW();
  `;

  const [rows, fields] = await pool.query(getUserQuery, [resetToken]);
  return rows[0];
}
