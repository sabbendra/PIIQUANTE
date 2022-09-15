const {app, express} = require("./server") //on importe app et express
const port = 3000
const path = require("path")//permet de cloner deux chemins ensemble

//connection à datebase
require("./mongo") // on a besoin de lancer le fichier mongo

//Controllers, les contrôles
const { createUser, logUser } = require("./controllers/users")
const { getSauces, createSauces, getSauceById, deleteSauce } = require("./controllers/sauces")

//middleware
const { upload }  = require("./middleware/multer")
const { authenticateUser } = require("./middleware/auth")

//routes
app.post("/api/auth/signup", createUser) 
app.post("/api/auth/login", logUser)
//authenticateUser est un middlew il se loge entre la requête et la réponse
app.get("/api/sauces", authenticateUser, getSauces)
//apres l'authentification, on va récupérer un fichier image et ensuite on va créer une sauce
app.post("/api/sauces", authenticateUser, upload.single("image"), createSauces)
app.delete("/api/sauces/:id", authenticateUser, deleteSauce)
app.get("/api/sauces/:id", authenticateUser, getSauceById)

app.get("/", (req, res) => res.send("hello world"))

//Listen
console.log(__dirname)
console.log(path.join(__dirname,"images"))

app.use("/images", express.static(path.join(__dirname, "images")))
app.listen(port, () => console.log("Listening on port" + port))
