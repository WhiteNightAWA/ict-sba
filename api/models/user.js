const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    google: {
        type: Boolean,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    photoURL: {
        type: String,
        default: "",
    },
    tokens: {
        type: [
            {
                token: {
                    type: String,
                    required: true,
                },
                expiredDate: {
                    type: Date,
                    required: true,
                    default: Date.now(),
                },
            },
        ],
    },
    createTime: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model("User", userSchema);
