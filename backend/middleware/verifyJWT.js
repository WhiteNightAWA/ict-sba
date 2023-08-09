const jwt = require("jsonwebtoken");
const {decode} = require("jsonwebtoken");

const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                code: 401,
                error: "unauthorized",
                error_description: "Invalid authorization header.",
                error_json: {},
            });
        }
        const token = authHeader.split(" ")[1];

        jwt.verify(
            token,
            process.env.ATS,
            (err, decoded) => {
                if (err) return res.status(401).json({
                    code: 401,
                    error: "Invalid refresh key.",
                    error_description: err.toString(),
                    error_json: err,
                });

                req.email = decoded.email;
                req.username = decoded.username;
                req.user_id = decoded.user_id;

                next();
            }
        );
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
    verifyJWT,
};
