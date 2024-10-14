const express = require("express");
const morgan = require("morgan");
const connectDB = require("./db/mongoose");
const userRouter = require("./routers/user");
const transactionRouter = require("./routers/transaction");

const app = express();
connectDB();
const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV === "development") {
  console.log("Running in development mode");
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(userRouter);
app.use(transactionRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
