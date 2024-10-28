const express = require("express");
const ticketController = require("../controllers/ticketController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin", "manager"),
    ticketController.getAllTickets
  )
  .post(
    authController.protect,
    authController.restrictTo("admin", "manager", "employee"),
    ticketController.uploadedFile,
    ticketController.createTicket
  );
router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin", "manager"),
    ticketController.getTicket
  )
  .patch(
    authController.protect,
    authController.restrictTo("admin", "manager"),
    ticketController.respondToTicket
  );
module.exports = router;
