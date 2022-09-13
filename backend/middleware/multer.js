const multer = require("multer")

const storage = multer.diskStorage({
    destination:"images/",
    filename: function(req,file,cb) {
        cb(null, makeFilename(req, file))
    }
})
function makeFilename(req,file) {
    //on retourne un nom de fichier
    //const fileName = Date.now() + file.originalname.split("").join("")replace(/\s/g,"-")
    const fileName = `${Date.now()} + ${file.originalname}`.replace(/\s/g, " ") 
    //on transforme la requete pour la réutiliser
    file.fileName = fileName
    return fileName
}
const upload = multer({ storage: storage })

//on a besoin d'exporter seulement upload
module.exports = { upload }