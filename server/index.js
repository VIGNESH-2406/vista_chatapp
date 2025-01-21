import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserModel from "./models/userModel.js";


// routes
import AuthRoute from './routes/AuthRoute.js'
import UserRoute from './routes/UserRoute.js'
import ChatRoute from './routes/ChatRoute.js'
import MessageRoute from './routes/MessageRoute.js'

const app = express();


// middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(express.static('public'));
app.use('/images', express.static('images'));
dotenv.config();
const PORT = 5000;

const uri = process.env.MONGODB_CONNECTION;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });


app.use('/auth', AuthRoute);
app.use('/user', UserRoute)
app.use('/chat', ChatRoute)
app.use('/message', MessageRoute)

const insert = async () => {
  try {
    // Define the agent data
    const agents = [
      {
        username: "agent1",
        password: "agent1",
        firstname: "Agent",
        lastname: "1",
        isAdmin: true,
      },
      {
        username: "agent2",
        password: "agent2",
        firstname: "Agent",
        lastname: "2",
        isAdmin: true,
      },
      {
        username: "agent3",
        password: "agent3",
        firstname: "Agent",
        lastname: "3",
        isAdmin: true,
      },
    ];

    // Insert agents into the database
    await UserModel.insertMany(agents);

   console.log({ message: "Agents added successfully!" });
  } catch (error) {
    console.error(error);
  }
}
insert()


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});