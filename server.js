const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
require("dotenv").config();
const rutasUser = require("./routes/rutas-user");
const rutasFeedback = require("./routes/rutas-feedback");
const rutasComment = require("./routes/rutas-comment");
const rutasReply = require("./routes/rutas-reply");
app.use("/api/user", rutasUser);
app.use("/api/feedback", rutasFeedback);
app.use("/api/comment", rutasComment);
app.use("/api/reply", rutasReply);
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested, Content-Type, Accept Authorization"
    )
    if (req.method === "OPTIONS") {
      res.header(
        "Access-Control-Allow-Methods",
        "POST, PUT, PATCH, GET, DELETE"
      )
      return res.status(200).json({})
    }
    next()
  })
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || "An unknown error has occured",
  });
});

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("escuchando...");
    });
  })
  .catch((error) => {
    console.log("error" + error);
  });
