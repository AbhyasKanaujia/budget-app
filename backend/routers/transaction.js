const express = require("express");
const Transaction = require("../models/transaction");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/transactions", auth, async (req, res) => {
  try {
    const transaction = new Transaction({ ...req.body, owner: req.user._id });
    await transaction.save();
    res.status(201).send(transaction);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((field) => {
        return {
          field,
          message: error.errors[field].message,
        };
      });
      res.status(400).send({ errors });
    } else res.status(500).send({ error: "Internal server error" });
  }
});

// GET /transactions?transactionType=income/expense
router.get("/transactions", auth, async (req, res) => {
  const match = {};
  const transactionType = req.query.transactionType;
  if (transactionType) {
    if (["income", "expense"].includes(transactionType))
      match.transactionType = req.query.transactionType;
    else
      return res.status(400).send({
        error: `Invalid transaction type "${transactionType}" provided in the query string. Valid options are "income" or "expense". Please adjust your request and try again.`,
      });
  }
  try {
    await req.user.populate({
      path: "transactions",
      match,
    });
    console.log(req.user.transactions);
    res.send(req.user.transactions);
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/transactions/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!transaction)
      return res.status(404).send({ error: "Transaction not found" });
    res.send(transaction);
  } catch (error) {
    console.log(error);
    if (error.name === "CastError")
      return res.status(404).send({ error: "Transaction not found" });
    res.status(500).send({ error: "Internal server error" });
  }
});

router.patch("/transactions/:id", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "description",
      "amount",
      "category",
      "transactionType",
      "createdAt",
    ];
    const invalidUpdates = updates.filter(
      (update) => !allowedUpdates.includes(update)
    );

    if (invalidUpdates.length > 0)
      return res
        .status(400)
        .send({ error: `Invalid updates. Cannot update: ${invalidUpdates}` });

    const transaction = await Transaction.findByOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!transaction) res.status(404).send({ error: "Transaction not found" });

    updates.forEach((update) => (transaction[update] = req.body[update]));
    await transaction.save();

    res.send(transaction);
  } catch (error) {
    console.log(error);
    if (error.name === "CastError")
      return res.status(404).send({ error: "Transaction not found" });
    else if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((field) => ({
        field: field,
        message: error.errors[field].message,
      }));
      return res.status(400).send({ errors: errors });
    } else res.status(500).send({ error: "Internal server error" });
  }
});

router.delete("/transactions/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!transaction)
      return res.status(404).send({ error: "Transaction not found" });
    res.send(transaction);
  } catch (error) {
    console.log(error)
    if (error.name === "CastError")
      res.status(404).send({ error: "Transaction not found" });
    else res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
