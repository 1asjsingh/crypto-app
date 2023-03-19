const createError = require("http-errors");
const leaderboard = require("../services/leaderboard.service");

const getPortfolioLeaderboard = (req, res, next) => {
  const currency = req.params["currency"];
  leaderboard
    .getPortfolioLeaderboard(currency)
    .then((portfolioLeaderboard) => res.json(portfolioLeaderboard))
    .catch((err) => {
      console.log("Error in /leaderboard/portfolio");
      // FIXME: What http status to use to forward error.
      next(createError(500, err));
    });
};

const updateUserGameScore = async (req, res, next) => {
  const userId = req.params["userId"];
  const newScore = parseInt(req.params["newScore"]);
  leaderboard
    .updateUserGameScore(userId, newScore)
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.log("couldn't update user's game score on leaderboard");
      // FIXME: What http status to use to forward error.
      next(createError(500, err));
    });
};

const getGameLeaderboard = async (_req, res, next) => {
  leaderboard
    .getGameLeaderboard()
    .then((gameLeaderboard) => res.json(gameLeaderboard))
    .catch((err) => {
      console.log("Error in /leaderboard/game");
      // FIXME: What http status to use to forward error.
      next(createError(500, err));
    });
};

module.exports = {
  getPortfolioLeaderboard,
  updateUserGameScore,
  getGameLeaderboard,
};
