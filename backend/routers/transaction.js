const express = require("express");
const Transaction = require("../models/transaction");

const router = express.Router();

router.post("/transactions", async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
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

router.get("/transactions", async (req, res) => {
  try {
    res.send(await Transaction.find());
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/transactions/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).send({ error: "Transaction not found" });
    res.send(transaction);
  } catch (error) {
    if (error.name === "CastError")
      return res.status(404).send({ error: "Transaction not found" });
    res.status(500).send({ error: "Internal server error" });
  }
});

router.patch("/transactions/:id", async (req, res) => {
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

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!transaction) res.status(404).send({ error: "Transaction not found" });

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

router.delete("/transactions/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction)
      return res.status(404).send({ error: "Transaction not found" });
    res.send(transaction);
  } catch (error) {
    if (error.name === "CastError")
      res.status(404).send({ error: "Transaction not found" });
    else res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
