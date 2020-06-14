const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require('./config-vars');
const router = require("express").Router();
const AWS = require('aws-sdk');
const path = require('path')
const { v4: uuidv4 } = require('uuid');



try {
  var AWSKey = require('./aws-keys.js');
} catch (ex) {
  console.log(`Error: ${ex}`)
}

const Admin = require("./admin-model.js");
const Product = require("./product-model.js");
const { isValid, isLoggedIn } = require("./admin-service.js");

const aws_access_key_id = process.env.AWS_ACCESS_KEY_ID || AWSKey.aws_access_key_id;
const aws_secret_access_key = process.env.AWS_SECRET_ACCESS_KEY || AWSKey.aws_secret_access_key;


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
  accessKeyId: aws_access_key_id,
  secretAccessKey: aws_secret_access_key
});



// .POST /api/admin/products
router.post("/products",isLoggedIn,  (req, res) => {
  var uploadParams = { Bucket: 'ctl-media1', Key: '', Body: '' };
 console.log(req.body)
  uploadParams.Body = req.body.imgFile;
  name_string = req.body.imgFile.substring(12)
  name_string = uuidv4() + '-' + name_string
  uploadParams.Key = name_string;
  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } if (data) {
      console.log("Upload Success", data.Location);
      req.body.imgFile = data.Location;
      res.status(201).json( data.Location );

    }
  });
})



module.exports = router;
