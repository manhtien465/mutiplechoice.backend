const mongoose = require("mongoose");
const Schema = mongoose.Schema
const Version = new Schema({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
  },
  linkdownloadOldVersion: {
    type: String
  },
  apk: [{ type: String }],
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "items"
  }

},
  {
    collection: "version"
  })
const version = mongoose.model("versions", Version)
module.exports = version