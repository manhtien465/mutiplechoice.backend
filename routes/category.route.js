const express = require('express');
const router = express.Router();
const Category = require("../controller/category.controller")
var express = require('express');
var router = express.Router();
const CategoryController = require("../controller/category.controller")
const passport = require("passport")
const passportConf = require('../passport');
const { body } = require("express-validator")
router.post("/api/v1/category/create", [
  body('name').notEmpty().isString().withMessage('you must supply name'),
  body('path').notEmpty().isString().withMessage('You must supply a path'),
  body('isRoot').optional().isBoolean().withMessage("must be boolean"),
  body("desc").optional().isString().withMessage("description must be string"),
  body("children").optional().isArray().withMessage("children must be array"),
  body("parentId").optional().isString().withMessage("parent id must be string")
],
  CategoryController.add
)

router.put("/api/v1/category/update", [
  body('id').notEmpty().withMessage('you must supply category'),
  body('desc').optional().isString().withMessage("decription must be string"),
  body('children').optional().isArray().withMessage("children must be array")
],
  CategoryController.update
)

router.put("/api/v1/category/update-parent", [
  body('newParentId').notEmpty().isString().withMessage('you must supply newParent'),
  body('oldParentId').notEmpty().isString().withMessage("you must supply oldParent"),
  body("id").notEmpty().isString().withMessage('You must supply id'),
],
  CategoryController.updateParent
)

router.get("/api/v1/category/get",
  CategoryController.get
)

router.get("/api/v1/category/get-sub/:id",
  CategoryController.getSub
)

router.put("/api/v1/category/set-order", [
  body('id').notEmpty().withMessage('you must supply id'),
  body('children').isArray().notEmpty().withMessage('You must supply a children must array'),
],
  CategoryController.setOrder
)
router.delete("/api/v1/category/delete",
  CategoryController.delete
)

module.exports = router;