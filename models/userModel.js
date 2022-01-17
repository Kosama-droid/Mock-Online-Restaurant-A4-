//username and password
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// We create a schema for a user
let userSchema = Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  //loggedin: { type: Boolean, required: true },
  privacy: {type: Boolean, required: true },
});

const User = mongoose.model("User", userSchema); //* -> create a collection "user"
module.exports = User;
