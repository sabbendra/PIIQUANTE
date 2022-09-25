//on importe mongoose pour interrargir avec la base de donnée
const mongoose = require("mongoose")
//Importation du module Node "file system" de Node qui va nous permettre de gérer le téléchargement, la modification et a suppression d'images.
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
    //si l'user est authentifié on fait un Product.find, on va récupérer les produits (products)
        Product.find({})
        .then((products) => res.send(products))
        .catch((error) => res.status(500).send(error))
}

//on créé cette fonction pour la réutiliser
function getSauce(req, res) {
    const { id } = req.params
    return Product.findById(id)
}

//Fonction qui permet de récupérer une seule sauce
function getSauceById(req, res) { 
    getSauce(req,res)
    .then((product) => sendClientResponse (product, res))
    .catch((err) => res.status(500).send(err))         
}

//Fonction qui permet de supprimer une sauce
function deleteSauce(req, res) {
    const {id} = req.params
    Product.findByIdAndDelete(id) //méthode mongoose pour deleter un objet si il a été trouvé dans la base de donnée
            .then((product) => sendClientResponse (product, res))
            .then((item) => deleteImage(item)) // suppréssion du produit localement
            .then((res)=> console.log("FILE DELETED", res))
            .catch((err) => res.status(500).send({message: err}))
}
 
//Fonction qui permet de modifier une sauce
function modifySauce(req, res) {
    //on va récupérer l'id dans les params qui est dans la requête
    const {
        params: {id}
    } = req
    const hasNewImage = req.file !=null // est ce que req.file est dif de null, si il y a une nouvelle image (oui ou non)
    
    const payload = makePayload(hasNewImage, req)
    //on va chercher le produit qu'il faut modifier, on va lui passer l'id et le payload
    Product.findByIdAndUpdate (id, payload)
    .then((dbResponse) => sendClientResponse (dbResponse, res))//on a trouvé un produit ou pas dans la database
    .then((product) => deleteImage(product)) //si le sendClientResponse est ok, on delete l'image
    .then((res)=> console.log("FILE DELETED", res))
    .catch((err) => console.error ("PROBLEM UPDATING:", err))
}

//Fonction qui permet de supprimer l'image d'une sauce
function deleteImage(product) {
    if (product == null) return // si le produit n'est pas  ds la BD, on ne fait rien
    const imageToDelete = product.imageUrl.split("/").at(-1)//on a besoin nom du fichier pour sup
    return unlink("images/" + imageToDelete) // on va sup l'image dans le dossier image et on fait un return dans deleteImage
}

//pour définir le payload (qui est dif du body)
function makePayload (hasNewImage, req) { // on a besoin de la nouvelle image et la requête
    if(!hasNewImage) return req.body // si il n'y a pas d'image on retourne req.body
    const payload = JSON.parse(req.body.sauce)//le body de la sauce est un chaine de caractère donc on le parse pour avoir un objet
    payload.imageUrl = makeImageUrl(req, req.file.fileName) 
    return payload
}

//c'est la fonction qui va renvoyer la réponse au client, on check dans la database le produit trouvé ou non
function sendClientResponse (product, res) {
    if (product == null) { // si la réponse est null, on envoi un message
        console.log("Nothing to update")
        return res.status(404).send ({ message: "Object not found in database" })
    }   //si la réponse est réussie on envoi un statut 200 
        console.log("All good, updating:", product)
        return Promise.resolve(res.status(200).send (product)).then(() => product) // on retourne une promise de produit
}

//fonction qui à partir de la requête récupère l'url de l'image
function makeImageUrl(req, fileName) {
    return req.protocol + "://" + req.get("host") + "/images/" + fileName
 }

//pour créer une sauce, res c'est la réponse qu'on reçoit
function createSauces(req, res) {
const { body, file } = req
const { fileName } = file
const sauce = JSON.parse(body.sauce)
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
 //message de succes, qu'on renvoi, la réponse est tout le product créé
 .then((message) => res.status(201).send({ message: message }))
    .catch((err) => res.status(500).send( err ))
 
}

//Fonction qui permet de liker ou disliker une sauce
function likeSauces(req,res) {
  const { like, userId } = req.body // on va chercher le like et l'userId de celui qui a liké

    //si le like est différent de 0,-1,1 on retourne une valeur 400 avec un message et on s'arrète
    if (![1, -1, 0].includes(like)) return res.stauts(403).send({message: "Invalid like value"})
    getSauce(req,res)// on va chercher le getSauce souhaité
    .then((product) => updateVote(product, like, userId, res))
    .then((pr) => pr.save())
    .then((prod) => sendClientResponse(prod, res))
    .catch((err) => res.status(500).send(err))
    }

//la fonction peut recevoir le product, like, userId
function updateVote(product, like, userId, res) {
        if(like === 1 || like === -1) return incrementVote(product, userId, like)
        return resetVote(product, userId, res)
    }

//fonction pour réinitialiser le vote (on enlève un like ou un dislike)
function resetVote(product, userId, res) {
   
    const { usersLiked, usersDisliked } = product
    //cas d'erreur qui vérifie si les 2 array ont l'userId
    if([usersLiked, usersDisliked].every((arr) => arr.includes(userId))) 
        return Promise.reject("User seems to have voted both ways")
    //some vérifie que l'userID n'est dans aucune des deux array
    if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId))) 
        return Promise.reject("User seems to not have voted")
    
    if (usersLiked.includes(userId)) {
        --product.likes 
        product.usersLiked = product.usersLiked.filter((id) => id !== userId)//on veut un ID différent de l'userID
    }else {
        --product.dislikes
        product.usersDisliked = product.usersDisliked.filter((id) => id !== userId)
    }
    return product
}

//fonction pour ajouter ou enlever un like
function incrementVote(product, userId, like) {
        const { usersLiked, usersDisliked } = product

        //on utilise ? pour savoir si like est = like alors on push dans usersLiked sinon usersDisliked
        const votersArray = like === 1 ? usersLiked : usersDisliked // ça sera soit disliked ou liked en fonction de si c'est -1 ou 1                                                                          
        
        if (votersArray.includes(userId)) return product // si le userId a déjà liké ou disliké on ne fait rien
        votersArray.push(userId)//sinon on push dans le userId 

        like === 1 ? ++product.likes : ++product.dislikes // et on push dans le product.likes ou dislikes
        return product 
    }

module.exports = { getSauces, createSauces, getSauceById, deleteSauce, modifySauce, likeSauces } 


