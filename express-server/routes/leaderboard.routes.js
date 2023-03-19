const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboard.controller");

router.get("/portfolio/:currency", leaderboardController.getPortfolioLeaderboard);
router.get("/updatescore/:userId/:newScore", leaderboardController.updateUserGameScore);
router.get("/game", leaderboardController.getGameLeaderboard);

module.exports = router;
