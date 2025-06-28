import Express from "express";
import mongoose from "mongoose";
import cors from "cors"
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { MainRoutes } from "routes/index.route";


const app = Express();

//CONSANTS
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

//CONNECTIONS
mongoose.connect(MONGO_URI)
    .then(INIT)
    .catch(err => console.log(err));
;



//Middlewares
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
    origin: "*",
    credentials: true
}))

//api
app.use("/api", MainRoutes)


async function INIT() {
    app.listen(PORT, () => {
        console.log("Listening on port " + PORT + "....")
    })

}
