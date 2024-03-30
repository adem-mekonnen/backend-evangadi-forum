const pool = require("../db/connect");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const User = {
  findByEmail: async function (email) {
    try {
      const [rows, fields] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      return rows[0]; // Assuming you want to return the first matching user
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error; // Propagate the error
    }
  },
  // Other model methods
};

// Create a transporter object using your email provider's SMTP settings
const transporter = nodemailer.createTransport({
  service: "Gmail", // Replace with your email service provider
  auth: {
    user: "adem.se2010@gmail.com", // Your email address
    pass: "npzt bzlm ehuv dwou", // Your email password or App password if using Gmail
  },
});

// Function to generate a unique token
function generateToken() {
  return crypto.randomBytes(20).toString("hex");
}

// Function to send password reset email with a generated token
async function sendPasswordResetEmail(email) {
  // Generate a unique reset token
  const resetToken = generateToken();

  // Store the reset token and expiry time in the database
  const expiryDate = new Date(Date.now() + 3600000); // Token expires in 1 hour
  try {
    await pool.query(
      "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?",
      [resetToken, expiryDate, email]
    );
  } catch (error) {
    console.error("Error storing reset token:", error);
    throw error;
  }

  // Compose the email with the reset token link
  const resetLink = `http://localhost:5173/reset/${resetToken}`;
  const mailOptions = {
    from: "adem.se2010@gmail.com",
    to: email,
    subject: "Password Reset",
    html: `
      <p>You've requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
    `,
  };

  // Send the password reset email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

module.exports = { User, sendPasswordResetEmail };
