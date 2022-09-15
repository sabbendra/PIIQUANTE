//pour vérifier le token
const mongoose = require("mongoose")
//pour supprimer l'image en local
//const unlink = require ("fs").promises.unlink
const {unlink} = require ("fs/promises")

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
    //1-la suppression est envoyé à mongo, la base de donnée
    Product.findByIdAndDelete(id)
            .then((product) => sendClientResponse (product, res))
            .then((item) => deleteImage(item)) // product c'est la réponse de fibdById...
            .then((res)=> console.log("FILE DELETED", res))
            .catch((err) => res.status(500).send({message: err}))
}

function modifySauce(req, res) {
    //on va récupérer l'id
    const {
        params: {id}
    } = req

    const hasNewImage = req.file !=null // est ce que req.file est dif de null
    const payload = makePayload(hasNewImage, req)

    Product.findByIdAndUpdate (id, payload)
    .then((dbResponse) => sendClientResponse (dbResponse, res))
    .then((product) => deleteImage(product)) // product c'est la réponse de fibdById...
    .then((res)=> console.log("FILE DELETED", res))
    .catch((err) => console.error ("PROBLEM UPDATING:", err))
}

function deleteImage(product) {
    if (product == null) return
    console.log("DELETE IMAGE", product)
    const imageToDelete = product.imageUrl.split("/").at(-1)
    return unlink("images/" + imageToDelete)
}

function makePayload (hasNewImage, req) {
    console.log("hasNewImage:", hasNewImage)
    if(!hasNewImage) return req.body
    const payload = JSON.parse(req.body.sauce)
    payload.imageUrl = makeImageUrl(req, req.file.fileName)
    console.log("Nouvelle img à gérer")
    console.log("voici le payload:", payload)
    return payload
}

function sendClientResponse (product, res) {
    if (product == null) {
        console.log ("NOTHING TO UPDATING")
        return res.status(404).send ({ message: "Object not found in database" })
    }
        console.log ("ALL GOOD, UPDATING:", product)
        return Promise.resolve(res.status(200).send ({ message: "Successfully updated" }))
        .then(() => product // on retourne une promise de produit
        )
}

function makeImageUrl(req, fileName) {
    return req.protocol + "://" + req.get("host") + "/images/" + fileName
 }

//pour créer une sauce, res c'est la réponse qu'on reçoit
function createSauces(req, res){
const { body, file } = req
console.log({body, file})
const { fileName } = file

const sauce = JSON.parse(req.body.sauce) // AJOUT DE REQ
console.log("sauce", sauce)
const { name, manufacturer, description, mainPepper, heat, userId } = sauce

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
module.exports = { getSauces, createSauces, getSauceById, deleteSauce, modifySauce } 


