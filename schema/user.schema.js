const mongoose = require('mongoose')
var bcrypt = require("bcryptjs")

const Schema = mongoose.Schema;

var userSchema = new Schema({

    username: {
        type: String,
        unique: String,
    },
    password: {
        type: String,
        minlength: 8,
        minlength: [8, 'Must be six characters long'],

    },
    email: {
        type: String,
        unique: true
    },

    role: {
        type: String,
        enum: ["USER", "ADMIN", "SUPERADMIN", "COLLABORATOR"],
        default: "USER",
    },
    isBan: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String
    },

    day: {
        type: Date,
        default: Date.now
    },

},
    {
        timestamps: true,
    },
    {
        collection: "User"
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.index({ email: 'text', addresses: 'text', phoneNumber: 'text' })
userSchema.pre("save", async function (next) {
    try {

        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(this.password, salt)
        //tao secretToken de gui verifi email

        //tao trang thai false (chua )

        this.password = passwordHash
        next()
    } catch (error) {
        console.log(error);

        next(error)
    }
})
userSchema.methods.isValidPassword = async function (newPassword) {
    try {
        return await bcrypt.compare(newPassword, this.password)                 //phair cos return
    } catch (error) {
        throw error
    }
}

module.exports = mongoose.model('users', userSchema);