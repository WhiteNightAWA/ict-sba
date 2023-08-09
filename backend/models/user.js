const mongoose = require("mongoose");
const { v4 } = require("uuid");


const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true,
        default: v4(),
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
    createTime: {
        type: Date,
        default: Date.now(),
    },
    lastLogin: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model("User", userSchema);
