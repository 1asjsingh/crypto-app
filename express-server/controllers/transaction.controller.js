const transactions = require("../services/transactions.service");
const createError = require("http-errors");

const buy = (req, res, next) => {
  const { userId, coin, quantity, currentPrice, costPrice, date } = req.body;
  // const date = req.get("Date") // req.startTime

  transactions
    .execute(userId, coin, quantity, currentPrice, costPrice, date, true)
    .then(() => res.sendStatus(200))
    .catch((err) => {
      // FIXME: What http status code to use here
      console.log(err.message)
      next(createError(500, err));
    });
};

const sell = (req, res, next) => {
  const { userId, coin, quantity, currentPrice, sellPrice, date } = req.body;
  transactions
    .execute(userId, coin, quantity, currentPrice, sellPrice, date, false)
    .then(() => res.sendStatus(200))
    .catch((err) => {
      // FIXME: What http status code to use here
      next(createError(500, err));
    });
};

module.exports = { buy, sell };
