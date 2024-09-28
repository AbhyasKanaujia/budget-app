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

// const user = new User({
//   email: "example@gmail.com",
// });

// user
//   .save()
//   .then(() => {
//     console.log(user);
//   })
//   .catch((error) => {
//     console.log(error.message);
//   });

const Transaction = mongoose.model("Transaction", {
  description: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
  },
  category: {
    type: String,
    default: "Other",
    trim: true,
  },
  transactionType: {
    type: String,
    enum: ["income", "expense"],
    default: "expense",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const transaction = new Transaction({
  description: "Salary",
  amount: 5000,
  transactionType: "income",
});

transaction
  .save()
  .then(() => {
    console.log(transaction);
  })
  .catch((error) => {
    console.log(error.message);
  });

module.exports = connectDB;
