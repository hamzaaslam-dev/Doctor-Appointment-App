const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
} = require("../controllers/adminctrl");
const router = express.Router();

//Get Users
router.get("/getAllUsers", authMiddleware, getAllUsersController);

//Get Doctors
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);
//posr
router.post(
  "/changeAccountStatus",
  authMiddleware,
  changeAccountStatusController
);
module.exports = router;
