const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllnotificationController,
  getAllDoctorController,
  bookAppointmentController,
  bookingavailability,
  userAppointmentsController,
} = require("../controllers/userCtrl");

const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

//routes
//Doctors

//LOGIN/ Post request
router.post("/register", registerController);

//Register/ Post request
router.post("/login", loginController);

//Auth/ Post Request
router.post("/getUserData", authMiddleware, authController);

//Apply Doctor||Post
router.post("/apply-doctor", authMiddleware, applyDoctorController);

//Notification
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);
//Delete Notification
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllnotificationController
);

router;

router.get("/getAllDoctors", authMiddleware, getAllDoctorController);

router.post("/book-appointment", authMiddleware, bookAppointmentController);

//booking availibility
router.post("/booking-availability", authMiddleware, bookingavailability);

router.get("/user-appointments", authMiddleware, userAppointmentsController);
module.exports = router;
