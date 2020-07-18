const router = require("express").Router();

const Product = require("./product-model.js");
const { isLoggedIn } = require("../admin/admin-service.js");


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

  router.get("/:id", (req, res) =>{
    Product.findProductById(req.params.id)
    .then(product => {
      res.status(200).json(product)
    })
    .catch( err =>{
      res.status(500).json({ message: err.message });
    })
  })


module.exports = router;