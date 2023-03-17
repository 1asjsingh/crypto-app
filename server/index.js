const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
//const admin = require("firebase-admin");
const db = require("./firestore");
const port = 4000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const axios = require("axios");

/*const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crypto-project-21534.firebaseio.com",
});

const db = admin.firestore();*/

const transactionRoutes = require("./routes/transactionRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/transaction", transactionRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/user", userRoutes);

app.listen(port, () => {
  console.log(`Express server listening on PORT ${port}`);
});
