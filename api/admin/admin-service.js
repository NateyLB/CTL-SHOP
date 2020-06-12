const jwt = require('jsonwebtoken');
const config = require('./config-vars');


module.exports = {
  isValid,
  isLoggedIn
};

function isValid(req, res, next) {
  if( req.body.username && req.body.password && typeof req.body.password === "string"){
    next()
  }
  else{
    res.status(400).json({message:'Please provide email and password, password shoud be alphanumeric'})
  }
}

function isLoggedIn(req, res, next){
  const token = req.headers.authorization;
  
  if(token){
  

    jwt.verify(token, config.jwtSecret, (error,decodedToken) =>{
      if(error){
        res.status(404).json({message:'YOU SHALL NOT PASS HACKER!'})
      }else{
        req.jwt = decodedToken;
        next();
      }
    })
  }else{
    res.status(400).json({message:'please provide the authentication.'})
  }
};