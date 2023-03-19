const createError = require("http-errors");
const { portfolioCalc } = require("../services/portfolio.service");
const users = require("../services/users.service");

const getPortfolio = (req, res, next) => {
  const userId = req.params["userId"];
  const currency = req.params["currency"];

  portfolioCalc(userId, currency)
    .then((portfolio) => res.json(portfolio))
    .catch((err) => {
      console.log("Error in /getPortfolio");
      console.log(err.message);
      // FIXME: What http status code to use here
      next(createError(500, err));
    });
};

const getHistory = (req, res) => {
  const userId = req.params["userId"];

  console.log("GONE INTO GETHISTORY FUNCTION");

  users
    .getTransactionHistory(userId)
    .then((transactionHistory) => res.json(transactionHistory))
    .catch((err) => {
      res.status(500);
      console.log("CAUGHT AN ERROR IN GETTING TRANSACTION HISTORY");
      // FIXME: What http status code to use here
      next(createError(500, err));
    });
};

module.exports = { getPortfolio, getHistory };
