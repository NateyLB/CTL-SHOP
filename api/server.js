const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const adminRouter = require("./admin/admin-router.js");
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors(corsOptions));

server.use("/api/admin", adminRouter);


server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
