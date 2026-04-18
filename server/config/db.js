const mongoose = require("mongoose");
const ShareDB = require("sharedb");
const ShareDBMongo = require("sharedb-mongo");

let backend;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    backend = new ShareDB({ db: ShareDBMongo(process.env.MONGO_URI) });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB, getBackend: () => backend };
