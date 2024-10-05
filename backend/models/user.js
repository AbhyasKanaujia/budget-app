const mongoose = require("mongoose");
const validator = require("validator");

const User = mongoose.model("User", {
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: (props) => `${props.value} is not a valid email address`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
    minlength: [8, "Password must be at least 8 characters long"],
    validate: {
      validator: (value) => !value.toLowerCase().includes("password"),
      message: "Password cannot contain the word password",
    },
  },
});

module.exports = User;
