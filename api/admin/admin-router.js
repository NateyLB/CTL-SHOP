const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
var multer = require('multer');



const Admin = require("./admin-model.js");
const Product = require("../products/product-model.js");
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
  Product.addProductHeader({
    name: req.body.name,
    item_type: req.body.type,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
  })
    .then(async product => {
      const uploadImg = (file) =>{
        const uploadParams = { Bucket: process.env.AWS_BUCKET_NAME, Key: uuidv4() + '-' + file.originalname, Body: file.buffer, ContentEncoding: 'base64', ContentType: file.mimetype, ACL: 'public-read' };
        return new Promise(async (resolve, reject)=>{
          await s3.upload(uploadParams, async function (err, data) {
            if (err) {
              console.log("Error", err);
              reject(err)
            } else {
              console.log("Upload Success", data.Location);
              resolve(await Product.addImage({ product_id: product.id, img_url: data.Location }))
            }
          });
        })
      }
      const uploadImgs = async () =>{
        const imgPromises = req.files.map(file=>uploadImg(file))
        return await Promise.all(imgPromises)
        
      }
      if (typeof req.body.sizes ==  'string') {
        const size = await Product.addSize({product_id: product.id, ...JSON.parse(req.body.sizes)})
        const img_urls = await uploadImgs()
        (res.status(201).json({
          product_id: product.id,
          name: product.name,
          item_type: product.item_type,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
          sizes: [size],
          img_urls: img_urls
        }))
        
      }
      else{
        const sizePromises = req.body.sizes.map(size => Product.addSize({ product_id: product.id, ...JSON.parse(size) }))
        const sizes = await Promise.all(sizePromises)  
        const img_urls = await uploadImgs()   
        res.status(201).json({
          product_id: product.id,
          name: product.name,
          item_type: product.item_type,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
          sizes: sizes,
          img_urls: img_urls
        })
      }

    })
    .catch(err => {
      res.status(500).json({ message: err.message });
    })
})

router.post("/products/:id", isLoggedIn,  (req,res) => {
  console.log(req.body)
Product.updateProductById(req.params.id, req.body)
.then(product => {
  res.status(200).json(product)
})
.catch( err =>{
  res.status(500).json({ message: err.message });
})
})





module.exports = router;
