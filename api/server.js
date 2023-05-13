const express = require("express");
const bcrypt = require("bcrypt");
const {sign} = require("jsonwebtoken");
const register = require("./auth/register");
const User = require("./models/user");
const mongoose = require("mongoose");
const EmailVerify = require("./models/emailVerify");
require("dotenv").config();

const app = express();
app.use(express.json());


// Data Base
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", (e) => console.log(e));
mongoose.connection.on('connected', function() {
    if (mongoose.connection.client.s.url.startsWith('mongodb+srv')) {
        mongoose.connection.db = mongoose.connection.client.db('main');
    }
    console.log('Connection to MongoDB established.')
});
db.once("open", () => console.log("Connected to Database."));


app.get("/", (req, res) => {
    res.send("hi");
});

app.post("/auth/signup", register);

app.post("/auth/login", async (req, res) => {


    const { email } = req.body;
    console.log(email);
    // await bcrypt.compare()

});


app.post("/auth/code", async (req, res) => {
    console.log("test");
    try {
        const { email } = req.body;

        if (await User.findOne({email})) {
            res.status(400).json({
                error: "register_email_existed",
                error_description: "This email has been registered.",
                code: 400,
            });
        } else {
            await EmailVerify.create({email});
            res.sendStatus(200);
        }
    } catch (err) {
        res.status(500).json({
            error: "server_error",
            error_description: err,
            code: 500,
        });
    }
});


function authToken(req, res, next) {
    const authHeader = req.headers.auth;
    const token = authHeader && authHeader.split(" ")[1];

    if (token === null) {
        return res.sendStatus(401)
    } else {
        jwt.verify(token, process.env.AT, (e, u) => {
            if (e) return res.sendStatus(403);
            console.log(u);
            req.u = u;
            next();
        })
    }
}


app.listen(3100, "localhost", () => {
    console.log("Server listening to 3100 port.");
});


