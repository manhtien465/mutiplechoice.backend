const express = require('express');
const router = express.Router();
const UserController = require("../controller/user.controller")
const passport = require("passport")
const passportConf = require('../passport');
const { body } = require('express-validator');
const { authorize } = require("../middleware/auth");
const advancedResults = require('../middleware/advancedResults');
const Users = require("../schema/user.schema")
/* GET users listing. */
router.post('/api/v1/users/create', [
  body('username').isString().notEmpty().withMessage('You must supply validate username '),
  body("email").notEmpty().isEmail().normalizeEmail().withMessage("you must supply validate email"),
  body("password").isString({ min: 8 }).notEmpty().withMessage("password msut be greater than 8")
],
  UserController.createuser)

//add 

router.route("api/v1/users/login/:token")
  // lay data
  .get(UserController.confirmEmail)
router.route("/api/v1/users/login")
  .post((req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).json(info)
      UserController.login(user, res, next)
    })(req, res, next);
  })//UserController.getFromRedis

router.put("api/v1/users/update",
  [
    body('id').notEmpty().withMessage('you must supply id'),
    body('firstName').isString().optional({ nullable: true }).withMessage('You must supply validate firstName '),
    body('lastName').isString().optional({ nullable: true }).withMessage('You must supply validate lastName '),
    body("email").notEmpty().isEmail().normalizeEmail().withMessage("you must supply validate email"),
    body("phoneNumber").isNumeric().optional({ nullable: true }).withMessage("you must supply phone number"),
    body('gender').isString().optional({ nullable: true }).withMessage("gender must be string"),
    body('shopName').isString().optional({ nullable: true }).withMessage("shop name must be supply validate"),
    body("dob").isDate().optional({ nullable: true }).withMessage("dob must be date"),
    body("addresses.phoneNumber").optional().isNumeric().withMessage("phone number must be Number"),
    body('addresses.state').optional().isString().withMessage("state must be string"),
    body("addresses.district").optional().isString().withMessage("must be string"),
    body("addresses.city").optional().isString().withMessage("must be string"),
    body("addresses.address").optional().isString().withMessage("must be string")
  ],
  passport.authenticate("jwt", { session: false }), UserController.updateUser
)

router.delete("api/v1/users/delete/:id", passport.authenticate("jwt", { session: false }), authorize("ADMIN"), UserController.deleteUser)

router.route("api/v1/users/login/forgotpassword")
  .post(UserController.forgotPassword)

router.route("api/v1/users/login/forgotpassword/confirm/:token")
  .post(UserController.changePassword)

router.get("api/v1/users/getall", advancedResults(Users), UserController.getAlluser)
// router.get("/get", advancedResults(Users), UserController.getAlluser)
router.post("api/v1/users/ban", UserController.banUser)
// router.route("/revoke")
//   .post(UserController.revokeRefreshtoken)

router.route("api/v1/checktoken")
  .post(passport.authenticate("jwt", { session: false }), UserController.checkToken)
module.exports = router;
