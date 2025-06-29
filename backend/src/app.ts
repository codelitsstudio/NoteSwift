import Express from "express";
import mongoose from "mongoose";
import cors from "cors"
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { MainRoutes } from "routes/index.route";
import userRoutes from './routes/userRoutes';

const app = Express();

//CONSANTS
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";


// CONNECTIONS
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✔️ Connected to MongoDB");
    INIT();
  })
  .catch(err => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1); // Exit if connection fails
  });




//Middlewares
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
    origin: "*",
    credentials: true
}))

//api
app.use("/api", MainRoutes)
app.use('/api/users', userRoutes);

async function INIT() {
    app.listen(PORT, () => {
        console.log("Listening on port " + PORT + "....")
    })
    

}
