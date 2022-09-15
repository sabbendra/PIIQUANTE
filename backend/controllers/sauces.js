//pour vérifier le token
const mongoose = require("mongoose")
//pour supprimer l'image en local
const {unlink} = require ("fs")

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
    usersLiked: { type:[String], required: false },
    usersDisliked: { type:[String], required: false }
})

const Product = mongoose.model("Product", productSchema)

//on va récupérer toutes les sauces
function getSauces(req, res){
    //si l'user est authentifié on fait un Product.find
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
            .then(product =>  res.send(product))
            .catch(console.error)              
}
       
function deleteSauce(req, res) {
    const id = req.params.id

    Product.findByIdAndDelete(id)
    // supprimer les images dans la base de donnée, il envoie le message a "deleteImage"
            .then(deleteImage)
            .then(product => res.send({message: product}))
            .catch(err => res.status(500).send({message: err}))
}

function deleteImage(product) {
    const imageUrl = product.imageUrl
    const fileToDelete = imageUrl.split("/").at(-1)
    unlink(`images/${fileToDelete}`,(err) => {
        console.log ("problème à la suppression de l'image", err)
    })
    return product
}
 
//pour créer une sauce, res c'est la réponse qu'on reçoit
function createSauces(req, res){
const { body, file } = req
console.log({body, file})
const { fileName } = file

const sauce = JSON.parse(req.body.sauce) // AJOUT DE REQ
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
    usersLiked: [],
    usersDisliked: []
 })
 product
 .save()
 .then((message) => {
    res.status(201).send({ message: message });
    return console.log("produit enregisté", message)
 })
 .catch(console.error)
}
module.exports = { getSauces, createSauces, getSauceById, deleteSauce } 


