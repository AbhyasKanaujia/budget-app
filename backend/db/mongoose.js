const mongoose = require("mongoose");
const validator = require("validator");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

const User = mongoose.model("User", {
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: (props) => `${props.value} is not a valid email address`,
    },
  },
});

const user = new User({
  email: "example@gmail.com",
});

user
  .save()
  .then(() => {
    console.log(user);
  })
  .catch((error) => {
    console.log(error.message);
  });

module.exports = connectDB;
