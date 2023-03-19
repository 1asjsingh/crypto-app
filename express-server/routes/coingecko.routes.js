const express = require("express");
const router = express.Router();
const coingeckoController = require("../controllers/coingecko.controller");

router.get("/currentprices/:currency", coingeckoController.getCurrentPrices);

module.exports = router;
