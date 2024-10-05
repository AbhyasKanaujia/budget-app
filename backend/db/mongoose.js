const mongoose = require("mongoose");

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

module.exports = connectDB;
