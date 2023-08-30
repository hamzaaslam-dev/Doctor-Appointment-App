const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
dotenv.config();
//rest object
const app = express();

//Connection to Database
connectDB();

//middlewares
app.use(morgan("dev"));
app.use(express.json());
//routes
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));

app.use("/api/v1/user", require("./routes/userRoutes"));
//static files
app.use(express.static(path.join(__dirname, "./client/build")));
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});
//port
const port = process.env.PORT;
//listen
app.listen(port, () => {
  console.log(
    `Server chal gaya in ${process.env.NODE_MODE} MODe on port${process.env.PORT}`
  );
});
