const mongoose = require("mongoose");
const doctorModel = require("../models/doctorModel");
const UserModel = require("../models/UserModels");
const appointmentModel = require("../models/appointmentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const registerController = async (req, res) => {
  try {
    const existinguser = await UserModel.findOne({ email: req.body.email });
    if (existinguser) {
      return res
        .status(200)
        .send({ message: "User Already exists", success: false });
    }
    const password = req.body.password;
    console.log(password);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    req.body.password = hash;

    const newUser = new UserModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Registerd Succesefuly", success: true });
  } catch (err) {
    console.log(err);
    res.status(500).send({ success: false, message: "Register failed" });
  }
};
const loginController = async (req, res) => {
  try {
    console.log("Login Conctrollers");
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      console.log("User doesnt exist");
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      console.log("wrong email or password");
      return res
        .status(200)
        .send({ message: "Invalid Email or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};
const authController = async (req, res) => {
  try {
    const user = await UserModel.findById({ _id: req.body.userId });

    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "User not Found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "auth error",
      success: false,
      err,
    });
  }
};
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await UserModel.findOne({ isAdmin: true });
    const notification = adminUser.notification;
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied for a Doctor Account`,
      doctorId: newDoctor._id,
      name: newDoctor.firstName + " " + newDoctor.lastName,
      onClickPath: "/admin/doctors",
    });
    await UserModel.findByIdAndUpdate(adminUser._id, { notification });
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied Successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
      message: "Error while applying for Doctor",
    });
  }
};

const getAllNotificationController = async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;
    seennotification.push(...notification);
    user.notification = [];
    user.seennotification = notification;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "All notification marked as read",
      data: updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      err,
    });
  }
};
const deleteAllnotificationController = async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted Successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Unable to delete all notifications",
      err,
    });
  }
};

const getAllDoctorController = async (req, res) => {
  try {
    console.log("doing");
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctors list fetched successfully",
      data: doctors,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
      message: "Error while fetching Doctors",
    });
  }
};

const bookAppointmentController = async (req, res) => {
  try {
    const date = req.body.date;
    const time = req.body.time;
    console.log(date);
    console.log(time);
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    ///console.log(req.body);S
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);

    await newAppointment.save();

    //Accessing the doctor and sending him notification
    const user = await UserModel.findOne({ _id: req.body.doctorInfo.userId });

    user.notification.push({
      type: "Doctor-appointment-request",
      message: `${req.body.userInfo.name} Applied for an appointment`,
      onClickPath: "/user/appointments",
    });
    await user.save();
    res.status(201).send({
      success: true,
      message: "Appointment Booked Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while Booking Appointment",
    });
  }
};
const bookingavailability = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    console.log(date);
    const availability = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (availability.length > 0) {
      console.log(date, fromTime, toTime);
      return res.status(200).send({
        message: "Appointments slot not Available at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        message: "Appointments slot Available at this time",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while checking availability",
    });
  }
};

const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "Users appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while fetching appointments",
    });
  }
};
module.exports = {
  bookingavailability,
  getAllDoctorController,
  getAllNotificationController,
  applyDoctorController,
  loginController,
  registerController,
  authController,
  deleteAllnotificationController,
  bookAppointmentController,
  userAppointmentsController,
};
