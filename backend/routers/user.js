const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.post("/users", async (req, res) => {
  try {
    if (await User.findOne({ email: req.body.email })) {
      return res
        .status(400)
        .send({ error: "An account with given email ID already exists" });
    }
    const user = new User(req.body);
    await user.save();
    const token = user.generateAuthToken();
    res.status(201).send({ user, token });
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

router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send({ error: "Email and password is required" });

  try {
    const user = await User.findByCredentials(email, password);
    const token = user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    console.log(error);

    res.status(401).send({ error: "Unable to login" });
  }
});

router.get("/users", async (req, res) => {
  try {
    res.send(await User.find());
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/users/:id", async (req, res) => {
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

router.patch("/users/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["email", "password"];
  const invalidUpdates = updates.filter(
    (update) => !allowedUpdates.includes(update)
  );

  if (invalidUpdates.length > 0)
    return res
      .status(400)
      .send({ error: `Invalid updates, cannot update: ${invalidUpdates}` });

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ error: "User not found" });

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

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

router.delete("/users/:id", async (req, res) => {
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

module.exports = router;
