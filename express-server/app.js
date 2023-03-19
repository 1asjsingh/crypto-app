const createError = require("http-errors");
const express = require("express");
const path = require("path");
// const cookieParser = require('cookie-parser');
const morgan = require("morgan");
// const cors = require('cors');

// Load `.env` variables into `process.env`
// FIXME: const node_env = process.env.NODE_ENV ? "." + process.env.NODE_ENV : "";
require("dotenv").config(); // FIXME: Use - .config(`.env${node_env}`) - ?

const transactionRoutes = require("./routes/transactionRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const userRoutes = require("./routes/userRoutes");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

// Jade view engine setup (for rendering errors)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "public")));

// Middleware registration (functions that should access all request objects)
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(cors());

// Sanity check
app.all("/hello", (req, res) => {
  return res.send("<p>Hello, <code>crypto-app</code>!</p>");
});

// crypto-app API route handler registration
app.use("/transaction", transactionRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/user", userRoutes);
app.use("/api", apiRoutes);

// Catch requests that haven't been handled by the route handlers and forward
// create a 404 error, and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler if all above routes don't terminate request-response cycle.
app.use(function (err, req, res, next) {
  // Only provide error during development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // NOTE: If you don't render error, change status() -> sendStatus() to
  //       terminate request-response cycle.
  res.status(err.status || 500);
  res.render("error", { title: "Error" });
});

module.exports = app;