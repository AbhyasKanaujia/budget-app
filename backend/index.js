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
      res.status(400).send(error);
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
      res.status(400).send(error);
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));