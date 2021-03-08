const Item = require("../schema/item.schema")




module.exports = {
  create: async (req, res, next) => {
    const { name } = req.body
    const item = Item.findOne({ name });
    if (item) {
      return res.status(400).json({ msg: "item have found" });
    }
  }
}