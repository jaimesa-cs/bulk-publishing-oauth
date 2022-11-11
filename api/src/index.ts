import "module-alias/register";

import cookieParser from "cookie-parser";
import cors from "cors";
import corsOptions from "./config/corsOptions";
import { csWithOauthRouter } from "./controllers/cs-oauth";
import express from "express";
import http from "http";
import { logger } from "./middleware/logEvents";
import session from "express-session";

require("dotenv").config();

const app = express();

// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

app.use("/api", csWithOauthRouter);

const port = process.env.PORT; // default port to listen
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
