const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
});

process.on("SIGTERM", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
});


module.exports = connectDB;
