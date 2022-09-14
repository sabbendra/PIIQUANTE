//pour vérifier le token
const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true }, 
    heat: { type: Number, required: true },
    likes: { type: Number, default:0 },
    dislikes: { type: Number, default:0 },
    userLiked: { type:[String] },
    userDisliked: { type:[String] }
})

const Product = mongoose.model("Product", productSchema)

//on va récupérer toutes les sauces
function getSauces(req, res){
   // authenticateUser(req,res)
    console.log("le token a été validé, nous sommes getSauces")
    //on va récupérer les produits (products)
        Product.find({})
        .then(products => res.send( products ))
        .catch(error => res.status(500).send(error))
     
}

function getSauceById(req, res) { 
    console.log(req.params)
    const id = req.params.id
    Product.findById(id)
            .then(product =>  {
            console.log("prod avec cet id:", product)
            res.send(product)
            })
            .catch(console.error)              
}
       

//pour créer une sauce, res c'est la réponse qu'on reçoit
function createSauces(req, res){
const { body, file } = req
console.log({body, file})
const { fileName } = file

const sauce = JSON.parse(body.sauce)
console.log("sauce", sauce)
const { name, manufacturer, description, mainPepper, heat, userId } = sauce

function makeImageUrl(req, fileName) {
    return req.protocol + "://" + req.get("host") + "/images/" + fileName
}
 const product = new Product({
    userId: userId,
    name: name,
    manufacturer: manufacturer,
    description: description,
    mainPepper: mainPepper, 
    imageUrl: makeImageUrl(req, fileName),
    heat: heat,
    likes: 0,
    dislikes: 0,
    userLiked: [],
    userDisliked: []
 })
 product
 .save()
 .then((message) => {
    res.status(201).send({ message: message });
    return console.log("produit enregisté", message)
 })
 .catch(console.error)
}
module.exports = { getSauces, createSauces, getSauceById } 


