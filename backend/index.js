const express = require("express");
const connectDB = require("./db/mongoose");
const User = require("./models/user");
const Transaction = require("./models/transaction");

const app = express();
connectDB();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.post("/users", (req, res) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => {
      res.status(201).send(user);
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
        const errors = Object.keys(error.errors).map((field) => ({
          field: field,
          message: error.errors[field].message,
        }));
        res.status(400).send({ errors: errors });
      } else if (
        error.name === "MongoServerError" &&
        error.message.startsWith("E11000") &&
        "email" in error.keyPattern
      ) {
        res.status(400).send({
          errors: [
            {
              field: "email",
              message: "An account with this email ID already exists",
            },
          ],
        });
      } else {
        res.status(500).send({ error: "Internal server error" });
      }
    });
});

app.get("/users", (req, res) => {
  User.find()
    .then((users) => res.send(users))
    .catch((error) => res.status(500).send({ error: "Internal server error" }));
});

app.get("/users/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      res.send(user);
    })
    .catch((error) => {
      console.log(error);
      if (error.name === "CastError") {
        res.status(400).send({ error: "Invalid User ID" });
      } else res.status(500).send({ error: "Internal server error" });
    });
});

app.post("/transactions", (req, res) => {
  const transaction = new Transaction(req.body);
  transaction
    .save()
    .then(() => {
      res.status(201).send(transaction);
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
        const errors = Object.keys(error.errors).map((field) => {
          return {
            field,
            message: error.errors[field].message,
          };
        });
        res.status(400).send({ errors });
      } else res.status(500).send({ error: "Internal server error" });
    });
});

app.get("/transactions", (req, res) => {
  Transaction.find()
    .then((transactions) => res.send(transactions))
    .catch((error) => res.status(500).send({ error: "Internal server error" }));
});

app.get("/transactions/:id", (req, res) => {
  Transaction.findById(req.params.id)
    .then((transaction) => {
      if (!transaction)
        return res.status(404).send({ error: "Transaction not found" });
      res.send(transaction);
    })
    .catch((error) => {
      if (error.name === "CastError")
        return res.status(400).send({ error: "Invalid transaction ID" });
      res.status(500).send({ error: "Internal server error" });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
