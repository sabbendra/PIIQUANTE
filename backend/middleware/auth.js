const jwt = require("jsonwebtoken")

//on identifie l'utilisateur
function authenticateUser(req, res, next) {
    console.log("authenticate User")

    //si l'autorisation n'est pas bonne on renseigne un message invalid    
    const header = req.header("Authorization")
    
        if (header == null) return res.status(403).send({ message: "Invalid" })

        const token = header.split(" ")[1]
        if (token == null) return res.status(403).send({ message: "Token cannot be null" })


    //on vérifie le token, on va décoder le token
    jwt.verify(token, process.env.JWT_PASSWORD, (err) => {
        if (err) return res.status(403).send({message: "Token invalid " + err }) 
        console.log("le token est bien valide, on continue")   
        next()
})
}

module.exports = { authenticateUser }