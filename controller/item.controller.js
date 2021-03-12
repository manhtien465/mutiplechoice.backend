const Item = require("../schema/item.schema")




module.exports = {
  create: async (req, res, next) => {
    const { name } = req.body
    // const item = Item.findOne({ name });
    // console.log(item);
    // if (item) {
    //   return res.status(400).json({ msg: "item have found" });
    // }
    const newItem = new Item({
      ...req.body
    })
    await newItem.save()
    res.json(newItem)
  },
  update: async (req, res, next) => {
    const { id } = req.body
    const updateItem = Item.findByIdAndUpdate(id, {
      ...req.body
    })
    if (!updateItem) {
      return res.status(400).json({ msg: "item not found" })
    }

  },
  gets: async (req, res, next) => {
    res.json(res.advancedResults)

  },
  get: async (req, res, next) => {
    const { id } = req.params
    console.log(id);
    const exitsItem = await Item.findById(id).populate("sub")
    if (!exitsItem) {
      return res.json({ msg: "ite  not found" })
    }
    res.json(exitsItem)
  }
}