const express = require("express");
const helmet = require("helmet");
const cors = require('cors');
const adminRouter = require("./admin/admin-router.js");
const productRouter = require("./products/product-router.js");
const shippingRouter = require('./shipping/shipping-router.js');
const paymentRouter = require('./payment/payment-router');


const server = express();


server.use(helmet());
server.use(express.json());
server.use(cors());

server.use("/api/admin", adminRouter);
server.use("/api/products", productRouter);
server.use("/api/shipping", shippingRouter);
server.use("/api/payment", paymentRouter)


server.get("/", (req, res) => {
  res.json({ api: "up" });
});


module.exports = server;
