const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    const token = authHeader && authHeader.split(" ")[1];
    if (!token || !/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/.test(authHeader)) {
      return res
        .status(401)
        .send({ error: "Invalid or missing Authorization header." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) throw new Error();

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    res
      .status(401)
      .send({ error: "Authentication failed. Invalid token or user." });
  }
};

module.exports = auth;
