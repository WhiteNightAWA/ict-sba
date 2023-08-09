const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");

const refresh = async (req, res) => {
    try {
        const cookies = req.cookies;

        if (!cookies?.jwtRT) return res.status(401).json({
            code: 401,
            error: "Invalid refresh key."
        });

        const jwtRT = cookies.jwtRT;

        jwt.verify(
            jwtRT,
            process.env.RTS,
            asyncHandler(async (err, decode) => {
                if (err) return res.status(401).json({
                    code: 401,
                    error: "Invalid refresh key.",
                    error_description: err.toString(),
                    error_json: err,
                });

                const user = await User.findOne({user_id});

                if (user) return res.status(401).json({
                    code: 401,
                    error: "Invalid user.",
                    error_description: err.toString(),
                    error_json: err,
                });

                const AT = jwt.sign({
                    email: user.email,
                    username: user.username,
                    user_id: user.user_id,
                }, process.env.ATS, {
                    expiresIn: "10m"
                });

                res.status(200).json({
                    success: "refresh_successfully",
                    msg: "Token refreshed successfully!",
                    code: 200,
                    at: AT,
                });
            })
        )
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
    refresh,
};
