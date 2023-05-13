const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const {ObjectId} = require("mongodb");
const bcrypt = require("bcrypt");

const app = express();
require("dotenv").config();
app.use(express.json);

console.log("hi");
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

app.get("/auth/signup", async (req, res) => {
    res.send({
        lol: "xd"
    })
})

const server = app.listen(3100, async () => {
    console.log("Server listening to 3100 port");

    console.log(await User.findOne({"test"}));
});

http.createServer(async (req, res) => {
    console.log("Server received req");
    if ( req.headers.origin === "https://whitenightawa.github.io" || req.headers.token === process.env.TOKEN ) {
        const startTime = new Date();
        const data = {
            time: startTime,
        };

        try {

            switch (req.headers.kind) {
                case "login":
                    // const user = await User.findOne({
                    //     username: "WhiteNightAWA"
                    // });
                    // console.log(user);
                    break;
                case "signup":

                    // await User.create({
                    //     _id: "nmgowi*H30wg",
                    //     google: false,
                    //     username: "WhiteNightAWA",
                    //     email: "s121101@kgnme",
                    //     password: "1564",
                    //     tokens: ["egs145sg"]
                    // })

                    break;
                case "3login":
                    break;
                default:
                    data.code = 400;
                    data.error = "error_while_processing";
                    data.error_description = "No kind.";
                    break;
            }

        }
        catch (e) {
            data.code = 400;
            data.error = "error_while_processing";
            data.error_description = e.toString();
        }

        const endTime = new Date();
        data.duration = endTime - startTime;
        endReq(res, data);
    } else {
        res.statusCode = 401;
        endReq(res, {
            error: "unauthorized_require",
            error_description: "This require isn't official.",
            code: 401
        });
    }



});


