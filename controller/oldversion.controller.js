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
  },
  getVersionOfItem: async (req, res, next) => {
    const reqQuery = { ...req.query }
    let query
    const removeFields = ['select', 'sort', 'page', 'limit']
    removeFields.forEach((param) => delete reqQuery[param])

    let queryStr = JSON.stringify(reqQuery)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

    query = Version.find(JSON.parse(queryStr))
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ')
      query = query.select(fields)
    }

    if (req.query.sort) {
      console.log(req.query.sort)
      query = query.sort(JSON.parse(req.query.sort))
    } else {
      query = query.sort({ createdAt: -1 })
      // '-createdAt'
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 12
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Version.countDocuments()
    const totalPage = Math.ceil(total / limit)

    if (parseInt(req.query.limit) !== 0) {
      query = query.skip(startIndex).limit(limit)
    }

    // if (populates) {
    //   populates.forEach((populate) => {
    //     query = query.populate(populate)
    //   })
    // }

    const results = await query

    // Pagination result
    const pagination = {}

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      }
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      }
    }

    if (parseInt(req.query.limit) !== 0) {
      res.json({
        success: true,
        count: results.length,
        totalPage,
        pagination,
        data: results
      })
    } else {
      res.json({
        success: true,
        data: results
      })
    }
  }
}