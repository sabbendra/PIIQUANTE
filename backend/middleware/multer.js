const multer = require("multer")
//on va l'enregistrer dans le disque
const storage = multer.diskStorage({
    //on enregistrer les images dans le dossier image
    destination: "images/",
    filename: function(req,file,cb) {
        cb(null, makeFilename(req, file))
    }
})

// c'est le dossier de l'image
function makeFilename(req,file) {
    //on retourne un nom de fichier
    //on nomme le fichier
    const fileName = `${Date.now()}-${file.originalname}`.replace(/\s/g, "-") 
    //on transforme la requete pour la réutiliser
    file.fileName = fileName
    return fileName
}
const upload = multer({ storage: storage })// prend l'argument storage(stockage)

//on a besoin d'exporter seulement upload
module.exports = { upload }