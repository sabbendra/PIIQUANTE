//Database
const mongoose = require('mongoose')
const uniqueValidator = require("mongoose-unique-validator")
const password = process.env.DB_PASSWORD 
const username = process.env.DB_USER
const db = process.env.DB_NAME

const uri = `mongodb+srv://${username}:${password}@cluster0.hl6gvhp.mongodb.net/${db}?retryWrites=true&w=majority`


mongoose
.connect(uri)
.then(() => console.log("Connexion à MongoDB réussie !"))
.catch(() => console.log("Connexion à MongoDB échouée !"));

const userSchema = new mongoose.Schema({
  //on met unique pour aller vérfier si l'email est unique
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true}
})
userSchema.plugin(uniqueValidator)

const User = mongoose.model("User", userSchema)

//c'est pour exporter mongoose et User
module.exports = {mongoose, User}