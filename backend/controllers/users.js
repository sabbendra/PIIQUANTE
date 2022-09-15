//on importe user depuis mongo
const {User} = require ("../mongo")//on veut le User dans le fichier mongo
const bcrypt = require("bcrypt")
const jwt = require ("jsonwebtoken")

async function createUser(req, res) {
    try {
    const { email, password } = req.body
    const hashedPassword = await hashPassword(password)
    console.log("password:", password)
    console.log("hashedPassword:", hashedPassword)

    const user = new User({ email, password: hashedPassword })
    await user.save()
        res.status(201).send({message: "Utilisateur enregistré !"})
    } catch (err) {
        res.status(409).send({message: "User non enregistré :" + err})
    }
  }

  function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds)
  }

  async function logUser(req, res) {
    try {
    const email = req.body.email
    const password = req.body.password
    
    //pour trouver une personne qui correspond a cet email dans la base de donnée
    const user = await User.findOne({ email: email })
    console.log(user)
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

  function createToken(email) {
    const jwtPassword = process.env.JWT_PASSWORD
    return jwt.sign({ email: email }, jwtPassword, { expiresIn: "24h"})
  }

  module.exports = { createUser, logUser }