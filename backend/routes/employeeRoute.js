const employeeController = require("../controllers/employeeController.js");
const authController = require("../controllers/authController.js");
const express = require("express");
const router = express.Router();

// Authentication Routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/refreshToken", authController.refreshToken);
router.post("/forgetpassword", authController.forgotPassword);
router.patch("/resetpassword/:token", authController.resetPassword);
router.patch("/updatepassword", authController.protect, authController.updatePassword);

// Employee Routes (restricted to admin)
router.route("/:id")
  .get(employeeController.getEmployee)
  .patch(employeeController.updateEmployee)
  .delete(employeeController.deleteEmployee);

router.route("/moreThanOne").post(employeeController.createEmployees);
router.route("/")
  .get(employeeController.getEmployees)
  .post(employeeController.createEmployee);

module.exports = router;
