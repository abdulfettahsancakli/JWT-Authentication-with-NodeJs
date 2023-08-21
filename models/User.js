const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter an username"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter an password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
});

//fire a function before doc saved to db
UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//static method to login
UserSchema.statics.login = async function (username, password) {
  const user = await this.findOne({ username });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Unmatched password");
  }
  throw Error("Incorrect username");
};

const User = mongoose.model("user", UserSchema);

module.exports = User;
