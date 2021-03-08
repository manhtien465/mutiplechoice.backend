

var express = require('express');
const passport = require("passport")
const passportConf = require('../passport');
const reviewController = require('../controller/review.controller');
const advancedResults = require('../middleware/advancedResults');
const Review = require('../schema/review.schema');
const { authorize } = require('../middleware/auth');
var router = express.Router();

router.get("/get",
  advancedResults(Review, ["userId"]),
  reviewController.get)
router.post("/create",
  passport.authenticate("jwt", { session: false }),
  authorize("CUSTOMER"),
  reviewController.create)
router.delete("/delete/:id", reviewController.delete)
module.exports = router;
