const express = require("express");
const helmet = require("helmet");
const cors = require('cors');
const bodyParser =require('body-parser');
const adminRouter = require("./admin/admin-router.js");


const server = express();

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(helmet());
server.use(express.json());
server.use(cors());

server.use("/api/admin", adminRouter);


server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
