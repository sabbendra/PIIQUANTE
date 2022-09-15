const {app, express} = require("./server") //on importe app et express
const {saucesRouter} = require("./routers/sauces.router")
const {authRouter} = require("./routers/auth.router")
const port = 3000
const path = require("path")//permet de cloner deux chemins ensemble

//connection à datebase
require("./mongo") // on a besoin de lancer le fichier mongo

//Middleware
app.use("/api/sauces", saucesRouter)
app.use("/api/auth", authRouter)

//Route
app.get("/", (req, res) => res.send("hello world"))

//Listen
app.use("/images", express.static(path.join(__dirname, "images")))
app.listen(port, () => console.log("Listening on port" + port))
