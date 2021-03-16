const express = require('express');

const ItemController = require('../controller/item.controller');
const { body } = require("express-validator")
const { authorize } = require("../middleware/auth");
const advancedResults = require('../middleware/advancedResults');
const Item = require('../schema/item.schema');
const router = express.Router();

router.post('/api/v1/item/create', [
  body('name').isString().withMessage('name must be word'),
  body('description').isString().withMessage('description must be word'),
  body('author').isString().withMessage('author must be word'),
  body('sub').isString().withMessage('category must be word'),
  body('Parentcategory').isString().withMessage('category must be word'),
  body('listImage').isArray().withMessage('list image must be array'),
  body('video').isString().withMessage('video must be link'),
  body('currentVersion').isString().withMessage('version must be word'),
  body('avatar').isString().withMessage('avatar must be word'),
  body('linkdownload').isString().withMessage('link download must be word')

],
  ItemController.create
)
router.put("/api/v1/item/update",
  [
    body('name').isString().withMessage('name must be word'),
    body('description').isString().withMessage('description must be word'),
    body('author').isString().withMessage('author must be word'),
    body('sub').isString().withMessage('category must be word'),
    body('Parentcategory').isString().withMessage('category must be word'),
    body('listImage').isArray().withMessage('list image must be array'),
    body('video').isString().withMessage('video must be link'),
    body('currentVersion').isString().withMessage('version must be word'),
    body('avatar').isString().withMessage('avatar must be word'),
    body('linkdownload').isString().withMessage('link download must be word'),
    body('finish').isBoolean().withMessage('finish must be true/false')

  ],

  ItemController.update
)
router.get("/api/v1/item/get/:id",

  ItemController.get
)
router.get('/api/v1/item/gets',
  advancedResults(Item, ["sub", "Parentcategory"]),
  ItemController.gets
)

router.post("/api/v1/item/download",

  ItemController.download)
module.exports = router;