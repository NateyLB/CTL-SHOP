const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require('./config-vars')
const router = require("express").Router();

const Admin = require("./admin-model.js");
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



module.exports = router;
