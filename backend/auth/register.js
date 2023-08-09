const User = require("../models/user");
const EmailVerify = require("../models/emailVerify");
const { hash } = require("bcrypt");


const register = async (req, res) => {
    try {
        const {username, email, code, password} = req.body;

        console.log(username, email, code, password);

        if ([username, email, code, password].includes(undefined)) {
            return res.status(400).json({
                error: "uncompleted_form",
                error_description: "Somethings is undefined in { username, email, code, password }.",
                code: 400,
            });
        }

        let DBcode = await EmailVerify.find({email});
        let codes = DBcode.map(x => x.code);
        console.log(codes)

        if (await User.findOne({email, google: false})) {
            return res.status(400).json({
                error: "register_email_existed",
                error_description: "The email has been registered.",
                code: 400,
            });
        } else if ([null, undefined].includes(DBcode)) {
            return res.status(400).json({
                error: "verify_email_not_sent_or_expired",
                error_description: "Verify email not sent or expired.",
                code: 400,
            });
            
        } else if (codes.includes(Number(code))) {
            // register user

            let user = await User.create({
                google: false,
                username,
                email,
                password: await hash(password, 12),
            });
            console.log(user);
            const { user_id } = user;

            await EmailVerify.deleteMany({ email });

            return res.status(200).json({
                code: 200,
                user_id,
                success: "register_successfully",
                msg: "Sign Up Successfully!",
            })
        } else {
            return res.status(400).json({
                error: "verify_code_incorrect",
                error_description: "The verify code of the email incorrect.",
                code: 400,
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "server_error",
            error_description: err.toString(),
            error_json: err,
            code: 500,
        });
    }
}

module.exports = {
    register
}