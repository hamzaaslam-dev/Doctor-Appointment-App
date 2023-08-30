const JWT = require("jsonwebtoken");
const authMiddleware = async (req, res, next) => {
  try {
    //console.log("TOken here");
    const token = req.headers["authorization"].split(" ")[1];
    // const token = "your_hardcoded_token_here";
    console.log(token);
    JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(200).send({
          message: "Auth Failed",
          success: false,
        });
      } else {
        req.body.userId = decode.id;
        next();
      }
    });
  } catch (err) {
    console.log(err);
    res.status(401).send({
      message: "Auth Failed",
      success: false,
    });
  }
};
module.exports = authMiddleware;
