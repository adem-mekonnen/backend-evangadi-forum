require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();

// security package middleware
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// authentication middleware
const authMiddleware = require("./middleware/authentication");

// router middlewares
const userRoute = require("./routes/userRout");
const questionRoute = require("./routes/questionRout");
const answerRoute = require("./routes/answerRout");
const restRout = require("./routes/resetRoute");
// error handler middleware
const notFoundMiddleware = require("./middleware/not-found");

// security  middleware
app.use(cors());
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(helmet());

// connectDB
const connectDB = require("./db/connect");

app.use(express.json());

// routes

app.use("/api/v1/user", userRoute);
app.use("/api/v1/question", authMiddleware, questionRoute);
app.use("/api/v1/answer", authMiddleware, answerRoute);
app.use("/api/v1/resetPassword", restRout);
app.use("/api/v1/reset", restRout);

// Default route
// Default route
app.get("/", (req, res) => {
  res.status(200).sendFile(__dirname + "/index.html");
});
// error handlers
app.use(notFoundMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB.execute('select "connected" ');
    console.log(`connected to DB `);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port} ...`);
    });
  } catch (error) {
    console.log(error.message);
  }
};

start();
