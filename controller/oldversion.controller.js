const Version = require("../schema/oldversion.schema")



module.exports = {
  gets: async (req, res, next) => {

    res.json(res.advancedResults)
  },
  get: async (req, res, next) => {
    const { id } = req.params
    const version = await Version.findById(id)
    if (!version) {
      return res.status(400).json({ msg: "not found" })
    }
    res.json(version)
  }
}