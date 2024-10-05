const mongoose = require("mongoose");

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
      message: "{VALUE} is not a valid transactionType, please select income or expense",
    },
    default: "expense",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Transaction;
