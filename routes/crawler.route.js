const express = require('express');
const router = express.Router();
const puppeterr = require("puppeteer");
const Crawler = require("../controller/crawler.controller")
router.route("/api/v1/crawler/getdata")
  .post(Crawler.getdata)

router.route("/api/v1/crawler/getcategory")
  .post(Crawler.getCategory)
router.route("/api/v1/crawler/update")
  .post(Crawler.getLinkAndoldversion)
module.exports = router;