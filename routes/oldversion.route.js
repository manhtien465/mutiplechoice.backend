const express = require('express');
const oldversionController = require('../controller/oldversion.controller');
const advancedResults = require('../middleware/advancedResults');
const Version = require('../schema/oldversion.schema');
const router = express.Router();

router.get("/api/v1/version/gets",
  advancedResults(Version),
  oldversionController.gets)
router.get("/api/v1/version/get/:id",
  oldversionController.get)
module.exports = router;