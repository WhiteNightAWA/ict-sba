const express = require("express");
const bcrypt = require("bcrypt");
const {sign} = require("jsonwebtoken");
const register = require("./auth/register");
const User = require("./models/user");
const mongoose = require("mongoose");
const EmailVerify = require("./models/emailVerify");
require("dotenv").config();
const nodemailer = require("nodemailer");
const {sendCode} = require("./auth/sendCode");

const server = express();
server.use(express.json());


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
	res.send("hi");
});

server.post("/auth/signup", register);

server.post("/auth/login", async (req, res) => {


	const { email } = req.body;
	console.log(email);
	// await bcrypt.compare()

});


server.post("/auth/code", sendCode);


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


server.listen(3100, "localhost", () => {
	console.log("Server listening to 3100 port.");
});


