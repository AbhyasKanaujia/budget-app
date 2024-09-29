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
  }
};

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
});

process.on("SIGTERM", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
});

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

const user = new User({
  email: "example@gmail.com",
  password: "12345678",
});

user
  .save()
  .then(() => {
    console.log(user);
  })
  .catch((error) => {
    console.log(error.message);
  });

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
    enum: {
      values: ["income", "expense"],
      message: "{VALUE} is not supported, please select income or expense",
    },
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
