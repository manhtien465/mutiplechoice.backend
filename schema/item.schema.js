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
    ref: "categories"
  },
  Parentcategory: {
    type: Schema.Types.ObjectId,
    ref: "categories"
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
  fiveStar: {
    type: Number,
    default: 0
  },
  fourStar: {
    type: Number,
    default: 0
  },
  threeStar: {
    type: Number,
    default: 0
  },
  twoStar: {
    type: Number,
    default: 0
  },
  oneStar: {
    type: Number,
    default: 0
  },
  // pointRating: {
  //   type: Double,
  //   default: 0
  // }
},
  {
    collection: "items"
  })
const item = mongoose.model("items", Item)
module.exports = item