const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");

router.get("/getCurrencies/:currency", apiController.getCurrencies);

module.exports = router;
