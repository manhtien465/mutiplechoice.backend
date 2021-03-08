const Review = require("../schema/review.schema");
const Item = require("../schema/item.schema")
// const Users=require("../schema/user.schema")
module.exports = {
  create: async (req, res, next) => {
    const { itemId } = req.body;
    const existItem = await Item.findByIdAndUpdate(itemId, {
      inc: { numberRating: 1 }
    })
    if (!existItem) {
      return res.json({ msg: "product not found" })
    }
    const newReview = new Review({
      ...req.body, userId: req.user._id
    })
    await newReview.save()
    res.json(newReview)
  },
  delete: async (req, res, next) => {
    const { id } = req.params

    try {
      const review = await Review.findById(id)
      if (!review) {
        return res.json({
          msg: "review not found"
        })
      }
      const existItem = await Item.findByIdAndUpdate(review._id, {
        inc: { numberRating: -1 }
      })
      await review.remove();
      res.json({
        msg: "remove successful"
      })

    } catch (error) {
      res.json({ msg: "some problem" })
    }
  },
  get: async (req, res, next) => {
    res.json(res.advancedResults)
  }
}
