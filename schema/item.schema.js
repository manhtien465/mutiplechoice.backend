const { Double } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema
const Item = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  author: {
    type: String
  },
  require: {
    type: String,
  },
  sub: {
    type: Schema.Types.ObjectId,
    ref: "category"
  },
  Parentcategory: {
    type: Schema.Types.ObjectId,
    ref: "category"
  },
  listImage: [{ type: String }],
  video: {
    type: String
  },
  currentVersion: {
    type: String
  },
  avatar: {
    type: String
  },
  linkdownload: {
    type: String
  },
  urlversion: {
    type: String
  },
  finish: {
    type: Boolean,
    default: false,
  },

  datePublish: {
    type: String
  },
  numberDownloaded: {
    type: Number,
    default: 0
  }

  // pointRating: {
  //   type: Double,
  //   default: 0
  // }
},
  {
    timestamps: true,
  },
  {
    collection: "items"
  })
Item.index({ name: 'text', description: 'text', author: "text" })
const item = mongoose.model("items", Item)
module.exports = item