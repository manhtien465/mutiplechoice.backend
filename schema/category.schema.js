const mongoose = require("mongoose");
const Schema = mongoose.Schema
const Category = new Schema({
    name: {
        type: String,
        required: true
    },
    isRoot: {
        type: Boolean,
        default: false,
    },
    icon: {
        type: String,
    },
    image: {
        type: String
    },
    desc: {
        type: String,
    },
    path: {
        type: String
    },
    children: [{
        type: Schema.Types.ObjectId
    }]

},
    {
        collection: "categories"
    })
const category = mongoose.model("category", Category)
module.exports = category