const mongoose = require("mongoose");
const Schema = mongoose.Schema
const ReviewSchema = new Schema({

    itemId: {
        type: Schema.Types.ObjectId,
        ref: "items"
    },
    review: {
        type: String,
    },
    starRate: {
        type: Number,
        default: 0
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users"
    }

},
    {
        timestamps: true,
    },
    {
        collection: "review"
    },
)
const review = mongoose.model("review", ReviewSchema)
module.exports = review