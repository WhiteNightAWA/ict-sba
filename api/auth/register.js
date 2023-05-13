const User = require("../models/user");
const EmailVerify = require("../models/emailVerify");

module.exports = register = async (req, res) => {
    try {
        const { username, email, code, password } = req.body;

        if (await User.findOne({email})) {
            return res.stats(400).json({
                error: "register_email_existed",
                error_description: "The email has been registered.",
                code: 400,
            });
        } else if (await EmailVerify.findOne({email}) === code) {
            console.log("okk");
        } else {

        }
    } catch (err) {
        return res.stats(500).json({
            error: "server_error",
            error_description: err,
            code: 500,
        });
    }
}