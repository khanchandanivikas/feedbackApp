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
app.use( cors({ origin: "*" }) )
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
