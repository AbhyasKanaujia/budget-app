const express = require("express");
const connectDB = require("./db/mongoose");
const User = require("./models/user");
const Transaction = require("./models/transaction");

const app = express();
connectDB();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.post("/users", async (req, res) => {
  try {
    if (await User.findOne({ email: req.body.email })) {
      return res
        .status(400)
        .send({ error: "An account with given email ID already exists" });
    }
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((field) => ({
        field: field,
        message: error.errors[field].message,
      }));
      res.status(400).send({ errors: errors });
    } else {
      res.status(500).send({ error: "Internal server error" });
    }
  }
});

app.get("/users", async (req, res) => {
  try {
    res.send(await User.find());
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send(user);
  } catch (error) {
    if (error.name === "CastError")
      return res.status(404).send({ error: "User not found" });
    res.status(500).send({ error: "Internal server error" });
  }
});

app.patch("/users/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["email", "password"];
  const invalidUpdates = updates.filter(
    (update) => !allowedUpdates.includes(update)
  );

  console.log("updates: ", updates);
  console.log("allowedUpdates: ", allowedUpdates);
  console.log("invalidUpdates: ", invalidUpdates);

  if (invalidUpdates.length > 0)
    return res
      .status(400)
      .send({ error: `Invalid updates, cannot update: ${invalidUpdates}` });

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    console.log(user);

    if (!user) return res.status(404).send({ error: "User not found" });

    res.send(user);
  } catch (error) {
    if (error.name === "CastError")
      return res.status(404).send({ error: "User not found" });
    else if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((field) => ({
        field: field,
        message: error.errors[field].message,
      }));
      return res.status(400).send({ errors: errors });
    } else res.status(500).send({ error: "Internal server error" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) res.status(404).send({ error: "User not found" });
    res.send(user);
  } catch (error) {
    console.log(error);
    if (error.name === "CastError")
      return res.status(404).send({ error: "User not found" });
    else res.status(500).send({ error: "Internal server error" });
  }
});

app.post("/transactions", async (req, res) => {
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

app.get("/transactions", async (req, res) => {
  try {
    res.send(await Transaction.find());
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

app.get("/transactions/:id", async (req, res) => {
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

app.patch("/transactions/:id", async (req, res) => {
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

app.delete("/transactions/:id", async (req, res) => {
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
