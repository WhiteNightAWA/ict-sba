const User = require("../models/user");
const {compare} = require("bcrypt");
const jwt = require("jsonwebtoken");


const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if ([email, password].includes(undefined)) {
            return res.status(400).json({
                error: "uncompleted_form",
                error_description: "Somethings is undefined in { email, password }.",
                code: 400,
            });
        }

        const user = await User.findOne({ email });

        if (!user || !(await compare(password, user.password))) {
            return res.status(400).json({
                error: "password_incorrect",
                error_description: "Invalid email or password.",
                code: 401,
            });
        }
        const jwtRT = req.cookies.jwtRT;

        if (jwtRT) {
            return res.status(400).json({
                error: "already_logged_in",
                error_description: "The cookies have jwt token",
                code: 400,
            });
        }
        await User.findByIdAndUpdate({ _id: user._id }, {
            lastLogin: Date.now(),
        });

        const AT = jwt.sign({
            email,
            username: user.username,
            user_id: user.user_id,
        }, process.env.ATS, {
            expiresIn: "30d"
        });

        res.status(200).cookie("jwt", AT, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            priority: "high"
            // httpOnly: false,
            // secure: false, // TODO turn on after dev
            // sameSite: "None",
        }).json({
            success: "login_successfully",
            msg: "Login successfully!",
            code: 200
        });


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "server_error",
            error_description: err.toString(),
            error_json: err,
            code: 500,
        });
    }
};


module.exports = {
    login,
};
