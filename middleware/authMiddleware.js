const jwt = require("jsonwebtoken");
const User = require('../models/User');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  //check json web token exist & is verified
  if (token) {
    jwt.verify(token, process.env.JWT, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
    // res.redirect("/login");
  }
};

//check current user
const checkUser = (req,res,next)=>{
const token = req.cookies.jwt;
if(token){
    jwt.verify(token, process.env.JWT,async (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.locals.user=null;
          next();
        } else {
          console.log(decodedToken);
          let user = await User.findById(decodedToken.id);
          res.locals.user=user;
          next();
        }
      });
}else{
    res.locals.user=null;
    next();
}
}

module.exports={requireAuth,checkUser};
