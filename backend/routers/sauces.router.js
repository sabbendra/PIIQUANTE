const express = require("express")
const { getSauces, createSauces, getSauceById, deleteSauce, modifySauce } = require("../controllers/sauces")
const { authenticateUser } = require("../middleware/auth")
const { upload }  = require("../middleware/multer")
const saucesRouter = express.Router ()

//authenticateUser est un middlew il se loge entre la requête et la réponse
saucesRouter.get("/", authenticateUser, getSauces)
//apres l'authentification, on va récupérer un fichier image et ensuite on va créer une sauce
saucesRouter.post("/", authenticateUser, upload.single("image"), createSauces)
saucesRouter.get("/:id", authenticateUser, getSauceById)
saucesRouter.delete("/:id", authenticateUser, deleteSauce)
saucesRouter.put("/:id", authenticateUser, upload.single("image"), modifySauce)

module.exports = {saucesRouter}