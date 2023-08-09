const mongoose = require("mongoose");

const emailVerifySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    code: {
        type: Number,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now(),
        index: { expires: 60*10 }
    }
});

module.exports = mongoose.model("EmailVerify", emailVerifySchema);
