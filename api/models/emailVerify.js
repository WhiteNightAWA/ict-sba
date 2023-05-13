const mongoose = require("mongoose");

const emailVerifySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    code: {
        type: Number,
        required: true,
        default:  Math.round(Math.random()*10**8)
    },
    createAt: {
        type: Date,
        default: Date.now(),
        index: { expires: 60 }
    }
});

module.exports = mongoose.model("EmailVerify", emailVerifySchema);
