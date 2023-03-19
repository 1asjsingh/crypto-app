// Load `.env` variables into `process.env`
require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
// const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const cors = require("cors");
const { executeLeaderboardUpdate } = require("./services/leaderboard.service"); // FIXME: Change import when refactored as service

const transactionRoutes = require("./routes/transaction.routes");
const portfolioRoutes = require("./routes/portfolio.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const userRoutes = require("./routes/user.routes");
const coingeckoRoutes = require("./routes/coingecko.routes");

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
app.use(cors());

// Sanity check
app.all("/hello", (req, res) => {
  return res.send("<p>Hello, <code>crypto-app</code>!</p>");
});

// crypto-app API route handler registration
app.use("/transaction", transactionRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/user", userRoutes);
app.use("/coingecko", coingeckoRoutes);

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

// Registering
// FIXME: Refactor executeLeaderboardUpdate into services/leaderboard.service.js and then fix this import
setInterval(executeLeaderboardUpdate, 3 * 60 * 1000);
// setInterval(executeLeaderboardUpdate, 3 * 1000);

module.exports = app;
