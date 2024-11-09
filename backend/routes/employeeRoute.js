const employeeController = require("../controllers/employeeController.js");
const authController = require("../controllers/authController.js");
const { body } = require("express-validator");
const express = require("express");
const router = express.Router();

router.post("/singUp", authController.signup);
router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.get("/refreshToken", authController.refreshToken);

//access only by admin
//restrictTo('admin')

router.get("/logout", authController.protect, authController.logout);
router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.get("/refreshToken", authController.refreshToken);
router.post("/forgetpassword", authController.forgotPassword);
router.patch("/resetpassword/:token", authController.resetPassword);

router.patch(
  "/updatepassword",
  authController.protect,
  authController.updatePassword
);

router.use(authController.protect);

router
  .route("/getEmployee")
  .post(employeeController.getEmployeeByEmailOrNummber);
router.route("/UpdateManagerDep").patch(employeeController.updateEmployeeDeps);
router.route("/moreThanOne").post(employeeController.createEmployees);
router.route("/delete/emp").post(employeeController.deleteEmployee);

router
  .route("/:id")
  .get(employeeController.getEmployee)
  .patch(employeeController.updateEmployee);
// .delete(employeeController.deleteEmployee);

router
  .route("/")
  .get(employeeController.getEmployees)
  .post(employeeController.createEmployee);

module.exports = router;
