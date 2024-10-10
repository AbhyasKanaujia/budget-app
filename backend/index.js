const express = require("express");
const connectDB = require("./db/mongoose");
const userRouter = require("./routers/user");
const transactionRouter = require("./routers/transaction");

const app = express();
connectDB();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(userRouter);
app.use(transactionRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
