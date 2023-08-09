const logout = async (req, res) => {

    const cookies = req.cookies;
    if (!cookies?.jwtRT) return res.sendStatus(204);

    res.clearCookie("jwtRT", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    }).stats(200).json({
        code: 200,
        success: "logout_successfully",
        msg: "Logout successfully!",
    });
};

module.exports = {
    logout,
};
