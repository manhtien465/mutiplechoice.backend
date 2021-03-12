

var express = require('express');
const passport = require("passport")
const passportConf = require('../passport');
const reviewController = require('../controller/rating.controller');
const advancedResults = require('../middleware/advancedResults');
const Review = require('../schema/review.schema');
const { authorize } = require('../middleware/auth');
var router = express.Router();

router.get("/api/v1/rating/get",
  advancedResults(Review, ["userId"]),
  reviewController.get)
router.post("/api/v1/rating/create",
  passport.authenticate("jwt", { session: false }),
  authorize("USER"),
  reviewController.create)
router.delete("/api/v1/delete/:id", reviewController.delete)
module.exports = router;
