const express = require("express");
const sseController = require("../controllers/sseController");
const authController = require("../controllers/authController.js");
const router = express.Router();

router.get("/", authController.protect, sseController.sseConnect);

module.exports = router;