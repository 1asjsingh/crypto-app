const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");

router.get("/getPortfolio/:currency/:id", portfolioController.getPortfolio);
router.get("/getHistory/:id", portfolioController.getHistory);

module.exports = router;
