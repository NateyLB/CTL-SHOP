const router = require("express").Router();

const Product = require("./product-model.js")


router.get("/", (req, res) => {
    // .GET /api/admin/products
    Product.findProducts()
    .then(products => {
      res.status(200).json(products)
    })
    .catch( err =>{
      res.status(500).json({ message: err.message });
    })
  })

module.exports = router;