const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require('./config-vars')
const router = require("express").Router();
var AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path')

const Admin = require("./admin-model.js");
const Product = require("./product-model.js");
const { isValid } = require("./admin-service.js");

function createToken(admin) {
  const payload = {
    sub: admin.id,
    username: admin.username,
  };

  const secret = config.jwtSecret;

  const options = {
    expiresIn: "1d",
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
router.post("/login",isValid, (req, res) => {
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

const s3 = new aws.S3({
  accessKeyId: config.aws_access_key_id,
  secretAccessKey: config.aws_secret_access_key
 });


// .POST /api/admin/products
router.post("/products", isValid, (req, res)=> {productImgUpload( req, res, ( error ) => {
  imgFile = req.body.imgFile;
  res.status(401).json({ post: "up"})
  s3.upload (uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } if (data) {
      console.log("Upload Success", data.Location);
      req.body.imgFile = data.Location
      Product.add(req.body)
      .then(product=>{
        res.status(401).json(product)
      })
      .catch(err=>{
        res.status(500).json({ message: err.message });
      })

    }
  });
  });
})



module.exports = router;
