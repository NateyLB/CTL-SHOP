const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
var multer = require('multer');
require('dotenv').config({ path: require('find-config')('.env') });


const Admin = require("./admin-model.js");
const Product = require("./product-model.js");
const { isValid, isLoggedIn } = require("./admin-service.js");
const { resolve } = require("path");
const { rejects } = require("assert");



function createToken(admin) {
  const payload = {
    sub: admin.id,
    username: admin.username,
  };

  const secret = process.env.JWT_SECRET

  const options = {
    expiresIn: "1w",
  };

  return jwt.sign(payload, secret, options);
}
// .POST /api/admin/register
router.post("/register", isValid, (req, res) => {
  const credentials = req.body;
  const rounds = process.env.BCRYPT_ROUNDS || 8;
  // hash the password
  const hash = bcryptjs.hashSync(credentials.password, rounds);
  credentials.password = hash;
  Admin.add(credentials)
    .then(admin => {
      res.status(201).json({ id: admin.id, username: admin.username });
    })
    .catch(error => {
      res.status(500).json({ message: error.message });
    });

})

// .POST /api/admin/login
router.post("/login", isValid, (req, res) => {
  const { username, password } = req.body;
  Admin.findBy({ "admin.username": username })
    .then(([admin]) => {
      if (admin && bcryptjs.compareSync(password, admin.password)) {
        const token = createToken(admin);
        res.status(200).json({ id: admin.id, username: admin.username, token })
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    })
    .catch(err => {
      res.status(500).json({ message: err.message });
    })
})

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


const upload = multer();
// .POST /api/admin/products
router.post("/products",upload.single("file"), isLoggedIn,  (req, res) => {
  var uploadParams = { Bucket: process.env.AWS_BUCKET_NAME, Key: uuidv4() + '-' + req.file.originalname, Body: req.file.buffer, ContentEncoding: 'base64', ContentType: req.file.mimetype, ACL: 'public-read' };
  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } if (data) {
      console.log("Upload Success", data.Location);
      req.body.file = data.Location;
      Product.addProduct({
        name: req.body.name ,
        item_type: req.body.type,
        description: req.body.description,
        color: req.body.color,
        price: req.body.price,
        quantity: req.body.quantity,
        img_url: req.body.file
      })
      .then(async product =>{
        const promises = await Promise.all([
          req.body.sizes.map( size =>Product.addSize({product_id: product.id, ...JSON.parse(size)}))
        ])
       
          // .then(responses=>{
          //   console.log(responses)
          // })
          Product.findSizesByProductId(product.id)
          .then(sizes=>{
            res.status(201).json({
              name: product.name,
              item_type: product.item_type,
              description: product.description,
              color: product.color,
              price: product.price,
              quantity: product.quantity,
              img_url: product.img_url,
              sizes: sizes,
            })
          })
      })
      .catch(err =>{
        res.status(500).json({ message: err.message });
      })      
    }
  });

})



module.exports = router;
