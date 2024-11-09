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

router.get("/with-response", ticketController.getTicketsWithResponse);
router.get("/without-response", ticketController.getTicketsWithoutResponse);
router.get("/filtered", ticketController.getFilteredTickets);
router.get("/today", ticketController.getTodayTickets);
router.get("/sort", ticketController.getTicketsByDateAsc);

router.get(
  "/getMyTickets",
  authController.protect,
  ticketController.getMyTickets
);
router
  .route("/createdby/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    ticketController.getTicketCreatedBy
  );
//getTicketCreatedBy == to create it's route

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
