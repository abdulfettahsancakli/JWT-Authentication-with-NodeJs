const User = require("../models/User");
const jwt = require("jsonwebtoken");
const openBreweryAPI = "https://api.openbrewerydb.org/breweries";
const axios = require("axios");
const JWT_SECRET = process.env.JWT;
// const { requireAuth, checkUser } = require('/middleware/authMiddleware'); 


//handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { username: "", password: "" };

  //duplicate error code
  if (err.code == 11000) {
    errors.username = "That username is already registered";
    return errors;
  }

  //incorrect email
  if (err.message === "incorrect username") {
    errors.email = "that user is not registered";
  }

  //incorrect password
  if (err.message === "Unmatched password") {
    errors.password = "That password is incorrect";
  }

  //validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT, { expiresIn: maxAge });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.create({ username, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.login(username, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};



// module.exports.breweries_get = async (req, res) => {
//   const query = req.query.query || '';
//   const apiUrl = query ? `${openBreweryAPI}/search?query=${query}` : openBreweryAPI;

//   try {
//     // Middleware kullanımı: requireAuth ve checkUser middleware'ları sırasıyla ekleniyor
//     requireAuth(req, res, async () => {
//       checkUser(req, res, async () => {
//         const response = await axios.get(apiUrl);
//         res.json(response.data);
//       });
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Error fetching breweries' });
//   }
// };







