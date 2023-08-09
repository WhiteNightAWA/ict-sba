const User = require("../models/user");
const EmailVerify = require("../models/emailVerify");
const nodemailer = require("nodemailer");
require("dotenv").config();
const asyncHandler = require('express-async-handler')

const realSend = false;

const sendCode = async (req, res) => {
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
            let data = await EmailVerify.create({
                email,
                code: Math.round(Math.random()*(10**8))
            });
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.MAIL,
                    pass: process.env.PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            if (realSend) {
                let info = await transporter.sendMail({
                    from: '"買D餸" <buy.d.song@gmail.com>',
                    to: email,
                    subject: "買D餸 Email Verification",
                    html: '<h1>Looks like you are registering on our website <a target="_blank" href="https://whitenightawa.github.io/ict-sba/">買D餸</a>.</h1>' +
                          "here are your verify code:" +
                          `<h1>${data.code}</h1>` +
                          "If you had not register on our site, please ignore/delete this mail."
                });
            }
            res.status(200).json({
                code: 200,
                success: "mail_sent_successfully",
                msg: "Mail sent!",
                severify: "success"
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "server_error",
            error_description: err.toString(),
            error_json: err,
            code: 500,
            msg: err.toString(),
            severify: "error"
        });
    }
}

module.exports = {
    sendCode
};