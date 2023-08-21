const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const app = express();
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middleware/authMiddleware");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
// middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set("view engine", "ejs");
const MONGODB_URL = process.env.MONGODB;
mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

// routes
app.get("*", checkUser);
app.get("/", (req, res) => res.render("home"));
app.get("/breweries", requireAuth, checkUser, async (req, res) => {
  const query = req.query.query || "";
  const apiUrl = query
    ? `${openBreweryAPI}/search?query=${query}`
    : openBreweryAPI;
  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching breweries" });
  }
});
app.use(authRoutes);

