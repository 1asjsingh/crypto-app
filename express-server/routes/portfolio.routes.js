const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolio.controller");

router.get("/fetch/:userId/:currency", portfolioController.getPortfolio);
router.get("/transactionhistory/:userId", portfolioController.getHistory);

module.exports = router;
