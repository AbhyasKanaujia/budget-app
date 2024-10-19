const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema(
  {
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
        message:
          "{VALUE} is not a valid transactionType, please select income or expense",
      },
      default: "expense",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
