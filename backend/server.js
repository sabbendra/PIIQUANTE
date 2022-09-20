require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")

//middleware 
app.use(cors())
app.use(express.json())//pour avoir accès au coeur de la requête dans req.body

module.exports = { app, express }