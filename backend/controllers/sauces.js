//on importe mongoose pour interrargir avec la base de donnée
const mongoose = require("mongoose")
//pour supprimer l'image en local
const {unlink} = require ("fs/promises")

const productSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true }, 
    heat: { type: Number, required: true },
    likes: Number,
    dislikes: Number,
    usersLiked: [String],
    usersDisliked: [String]
})

const Product = mongoose.model("Product", productSchema)

//on va récupérer toutes les sauces
function getSauces(req, res){
    //si l'user est authentifié on fait un Product.find
    //on va récupérer les produits (products)
        Product.find({})
        .then((products) => res.send(products))
        .catch((error) => res.status(500).send(error))
}

function getSauce(req, res) {
    const { id } = req.params
    return Product.findById(id)
}

function getSauceById(req, res) { 
    getSauce(req,res)
    .then((product) => sendClientResponse (product, res))
    .catch((err) => res.status(500).send(err))         
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
        return Promise.resolve(res.status(200).send (product)).then(() => product) // on retourne une promise de produit
}

function makeImageUrl(req, fileName) {
    return req.protocol + "://" + req.get("host") + "/images/" + fileName
 }

//pour créer une sauce, res c'est la réponse qu'on reçoit
function createSauces(req, res) {
const { body, file } = req
const { fileName } = file
const sauce = JSON.parse(body.sauce) // AJOUT DE REQ
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
 .then((message) => res.status(201).send({ message: message }))
    .catch((err) => res.status(500).send( err ))
 
}

function likeSauces(req,res) {
  const { like, userId } = req.body
    // like peut être égal à 0,1 ou -1 donc si like est différent de tout ça on arrête
    //si le like est différent de 0,-1,1 on retourne une valeur 400 avec un message
    if (![1, -1, 0].includes(like)) return res.stauts(403).send({message: "Invalid like value"})
    
    getSauce(req,res)
    .then((product) => updateVote(product, like, userId, res))
    .then((pr) => pr.save())
    .then((prod) => sendClientResponse(prod, res))
    .catch((err) => res.status(500).send(err))
    }

function updateVote(product, like, userId, res) {
        if(like === 1 || like === -1) return incrementVote(product, userId, like)
        return resetVote(product, userId, res)
    }

function resetVote(product, userId, res) {
   
    const { usersLiked, usersDisliked } = product
    if([usersLiked, usersDisliked].every((arr) => arr.includes(userId))) 
        return Promise.reject("User seems to have voted both ways")

    if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId))) 
        return Promise.reject("User seems to not have voted")

    if (usersLiked.includes(userId)) {
        --product.likes
        product.usersLiked = product.usersLiked.filter((id) => id !== userId)
    }else {
        --product.dislikes
        product.usersDisliked = product.usersDisliked.filter((id) => id !== userId)
    }
    return product
}
    
function incrementVote(product, userId, like) {
        const { usersLiked, usersDisliked } = product

        const votersArray = like === 1 ? usersLiked : usersDisliked // ça sera soit disliked ou liked en fonction de si c'est -1 ou 1                                                                          
        if (votersArray.includes(userId)) return product
        votersArray.push(userId)

        like === 1 ? ++product.likes : ++product.dislikes
        return product 
    }

module.exports = { getSauces, createSauces, getSauceById, deleteSauce, modifySauce, likeSauces } 


