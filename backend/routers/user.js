const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");

const router = express.Router();

// Signup
router.post("/users", async (req, res) => {
  try {
    if (await User.findOne({ email: req.body.email })) {
      return res
        .status(400)
        .send({ error: "An account with given email ID already exists" });
    }
    const user = new User(req.body);
    const token = await user.generateAuthToken();
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

// Login
router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send({ error: "Email and password is required" });

  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    console.log(error);

    res.status(401).send({ error: "Unable to login" });
  }
});

router.get("/users/me", auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Logout
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (tokenObj) => tokenObj.token !== req.token
    );
    await req.user.save();

    res.send({ message: "Logout successful" });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Logout from all sessions
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send({ message: "Logged out from all devices" });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

router.patch("/users/me", auth, async (req, res) => {
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
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.send(req.user);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((field) => ({
        field: field,
        message: error.errors[field].message,
      }));
      return res.status(400).send({ errors: errors });
    } else res.status(500).send({ error: "Internal server error" });
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.deleteOne();
    res.send(req.user);
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }

    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200);
  } catch (error) {
    res.status(500).send({
      error: "Internal server error",
    });
  }
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) throw new Error();

    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;
