const userModel = require("../models/UserModels");
const doctorModel = require("../models/doctorModel");
//import { notification } from "antd";
//import { message } from "antd";
const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "users data",
      data: users,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "error while fetching users",
      err,
    });
  }
};

const getAllDoctorsController = async (req, res) => {
  console.log("all doctor ctrl");
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctors data",
      data: doctors,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "error while fetching doctors",
      err,
    });
  }
};

const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status });
    const user = await userModel.findOne({ _id: doctor.userId });
    const notification = user.notification;
    notification.push({
      type: "doctor=account-request,updated",
      message: `Your Doctor Account Request Has ${status} `,
      onClickPath: "/notification",
    });
    user.isDoctor = status === "approved" ? true : false;
    await user.save();
    res.status(201).send({
      success: true,
      message: "Account Status Updated",
      data: doctor,
    });
  } catch (err) {
    console.log("Error while approving the doctor");
    console.log(err);
    res.status(500).send({
      success: false,
      message: "error while approving as Doctor",
      err,
    });
  }
};

module.exports = {
  getAllDoctorsController,
  getAllUsersController,
  changeAccountStatusController,
};
