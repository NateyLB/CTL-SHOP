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
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


const upload = multer();
// .POST /api/admin/products
router.post("/products", upload.array("file"), isLoggedIn, (req, res) => {
  Product.addProduct({
    name: req.body.name,
    item_type: req.body.type,
    description: req.body.description,
    color: req.body.color,
    price: req.body.price,
    quantity: req.body.quantity,
  })
    .then(async product => {
      await Promise.all([
        req.body.sizes.map(size => Product.addSize({ product_id: product.id, ...JSON.parse(size) })),
        req.files.map(file => {
          var uploadParams = { Bucket: process.env.AWS_BUCKET_NAME, Key: uuidv4() + '-' + file.originalname, Body: file.buffer, ContentEncoding: 'base64', ContentType: file.mimetype, ACL: 'public-read' };
          s3.upload(uploadParams, async function (err, data) {
            if (err) {
              console.log("Error", err);
            } if (data) {
              console.log("Upload Success", data.Location);
              return Product.addImage({ product_id: product.id, img_url: data.Location })
            }
          });
        })
      ])
        .then(async values => {
          console.log(values, "INSERT SIZE AND URL")
          await Promise.all([
            Product.findSizesByProductId(product.id),
            Product.findImagesByProductId(product.id)
          ])
            .then(values => {
              console.log(values)
              res.status(201).json({
                name: product.name,
                item_type: product.item_type,
                description: product.description,
                color: product.color,
                price: product.price,
                quantity: product.quantity,
                sizes: values[0],
                img_urls: values[1]
              })
            })
        })
    })
    .catch(err => {
      res.status(500).json({ message: err.message });
    })
})




module.exports = router;
