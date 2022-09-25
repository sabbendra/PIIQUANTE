//on importe user depuis mongo
const {User} = require ("../mongo")//on veut le User dans le fichier mongo
//on importe le package bcrypt destiné à hascher le mot de passe afin de se prémunir des attaques par force brut
const bcrypt = require("bcrypt")
//on importe le package jwt destié à attribuer un token d'identification lors de la connexion
const jwt = require ("jsonwebtoken")

async function createUser(req, res) {
  //On va hacher le mot de passe avec 10 tours)
    try {
    const { email, password } = req.body
    const hashedPassword = await hashPassword(password)
    console.log("password:", password)
    console.log("hashedPassword:", hashedPassword)
  //on créé le nouvel utilisateur    
    const user = new User({ email, password: hashedPassword })
    await user.save()
        res.status(201).send({message: "Utilisateur enregistré !"})
    } catch (err) {
        res.status(409).send({message: "User non enregistré :" + err})
    }
  }
  
  //on créé une fonction qui va crypter le mot de passe à partir d'un password
  function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds)
  }

  async function logUser(req, res) {
    try {
    const email = req.body.email
    const password = req.body.password
    
    //pour trouver une personne qui correspond à cet email dans la base de donnée
    const user = await User.findOne({ email: email })
    console.log(user)
    //on compare le mot de passe avec le hash si ce n'est pas ok on envoie un 403
    const isPasswordOk = await bcrypt.compare(password, user.password)
    //si le password n'est pas bon on envoie un 403
    if(!isPasswordOk){
        res.status(403).send({ message: "Mot de passe incorrect"})
    }
    const token = createToken(email)
    res.status(200).send({ userId: user?._id, token: token})    
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Erreur interne" })
  }
}
  
  // utilisation de jwt pour obtenir un token encodé
  function createToken(email) {
    const jwtPassword = process.env.JWT_PASSWORD
    //le token à une durée de validité de 24h
    return jwt.sign({ email: email }, jwtPassword, { expiresIn: "24h"})
  }

  module.exports = { createUser, logUser }