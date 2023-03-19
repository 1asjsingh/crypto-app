const axios = require("axios");
const createError = require("http-errors");
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 60 });

const BASE_URL = `https://api.coingecko.com/api/v3/`;

const { supportedCoins, supportedCurrencies } = require("../config");
const coingecko = require("../services/coingecko.service");

/**
 * Function that returns list of coin details while
 * caching the response to reduce API requests.
 * @param    {String} currency vs_currency of the user
 * @return   {object}          API Res of coin details
 */
const getCurrentPrices = (req, res, next) => {
  const currency = req.params["currency"];

  coingecko.getCurrentPrices(currency)
    .then((current_prices) => res.json(current_prices))
    .catch((err) => {
      let err_msg = err.message.toLowerCase();
      if (err_msg.includes("not found")) {
        err = createError.NotFound();
      } else if (err_msg.includes("bad request")) {
        err = createError.BadRequest();
      } else if (err_msg.includes("too many requests")) {
        err = createError.TooManyRequests();
      } else if (
        err_msg.includes("unauthorised") ||
        err_msg.includes("unauthorized")
      ) {
        err = createError.Unauthorized();
      } else {
        err = createError(500, err);
      }
      next(err);
    });
};

module.exports = { getCurrentPrices };
