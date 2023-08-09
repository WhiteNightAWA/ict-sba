const express = require("express");
const bcrypt = require("bcrypt");
const {sign} = require("jsonwebtoken");
const {register} = require("./auth/register");
const {login} = require("./auth/login");
const User = require("./models/user");
const mongoose = require("mongoose");
const EmailVerify = require("./models/emailVerify");
require("dotenv").config();
const nodemailer = require("nodemailer");
const {sendCode} = require("./auth/sendCode");
var cookieParser = require('cookie-parser')

const port = process.env.PORT || 3100;
const cors = require('cors');
const server = express();

server.use(express.json());
server.use(cookieParser());
server.use(cors());

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

server.get("/", (req, res) => {
	res.send("Welcome to the backend of https://whitenightawa.github.io/ict-sba/");
});
server.use("/auth", require("./routes/authRouter"));


server.listen(port, () => {
	console.log(`Server listening to ${process.env.PORT || 3100} port.`);
});


