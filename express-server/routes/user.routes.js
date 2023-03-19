const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");

router.get("/details/:userId", userController.getUserDetails);

module.exports = router;
