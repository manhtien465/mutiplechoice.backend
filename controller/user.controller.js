const User = require("../schema/user.schema")
const JWT = require("jsonwebtoken");
const auth = require("../middleware/verifyToken");
const { validationResult } = require('express-validator');
const { addRefreshTokenToList, updateRefreshTokenfromList, removeRefreshTokenfromList, clientredis } = require("../middleware/redis")
const key = require("../config/index")
const {
  sendConfirmationEmail,
  sendConfirmationEmailToChangepassword
} = require("../middleware/mailer");
const verifyToken = require("../middleware/verifyToken");
const config = require("../config/index");
const {
  timeExpRefreshtoken
} = require("../config/index");
const Items = require("../schema/item.schema");

const tokenList = {};

const signToken = (users, exp) => {
  return JWT.sign({
    iss: "xoaycodeeasy",
    sub: users._id,
    iat: new Date().getTime(), // current time
    exp: exp, //Math.floor(Date.now() / 1000) + (60*60*12) 1h =60*60
  },
    key.secretkey, {

  }
  );
};
const refreshToken = (users, exp) => {
  return JWT.sign({
    iss: "refreshToken",
    sub: users._id,
    iat: new Date().getTime(),
    exp: exp // Math.floor(Date.now() / 1000) + (60*60*12)
  },
    key.refreshtoken
  )
}

module.exports = {
  deleteUser: async (req, res, next) => {
    const { id } = req.params;
    const existUser = await User.findById(id)
    if (existUser._id === req.user._id) {
      res.status(404).json({ msg: "not not delete user self" })
    }
    if (!existUser) {
      res.json(404).json({ msg: "user not found" })
    }
    await existUser.remove()
    res.json({ msg: "success" })
  },
  updateUser: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.body
    // delete req.body.addresses;
    // addresses.address = `${addresses.district} ${addresses.state} ${addresses.city}`
    // console.log(req.body);
    const updateItem = await User.findByIdAndUpdate(id, {
      $set: req.body,

    },
      {
        useFindAndModify: false,
        new: true,
        runValidators: true
      }
    )
    if (!updateItem) {
      return res.json({ msg: "not found" })
    }
    res.json(updateItem)
  },
  getAlluser: async (req, res, next) => {
    // let {
    //   day,
    //   month,
    //   year
    // } = req.query
    // var currdatetime = new Date();
    // day = day ? day : "02";
    // month = month ? month : "01"
    // year = year ? year : "2021"
    // let gt = `${year}-${month}-${day}`
    // let lt = `${year}-${month + 1}-${day}`
    // const user = await User.find({
    //   createdAt: {
    //     $gt: new Date(gt),
    //     $lt: new Date(lt)
    //   }
    // })
    res.json(res.advancedResults)
  },
  createuser: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, username } = req.body;

      const user = await User.findOne({
        email: email
      })
      if (user) {
        return res.status(400).json({
          msg: "Email has already exist"
        })
      }
      const user1 = await User.findOne({
        username: username
      })
      if (user1) {
        return res.status(400).json({
          msg: "username has already exist"
        })
      }
      var newuser = new User({
        ...req.body
      })
      const result = await newuser.save();
      // await sendConfirmationEmail(result)
      return res.json({
        user: newuser,
        // msg: "please check you mail"
      })
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }

  },
  confirmEmail: async (req, res, next) => {
    const decode = JWT.verify(req.params.token, key.secretkey);
    const updateUser = await User.findByIdAndUpdate(decode.sub, { active: true }, {
      new: true,
      runValidators: true
    })
    res.status(200).json({
      msg: "active email successful"
    })
  },
  login: async (user, res, next) => {

    try {
      const expToken = Math.floor(Date.now()) + (config.timeExpToken * 1000)
      const expRefreshToken = Math.floor(Date.now()) + (config.timeExpRefreshtoken * 1000)
      const token = signToken(user, expToken)
      const refreshtoken = refreshToken(user, expRefreshToken)
      const JsonUser = JSON.stringify(user)
      // addRefreshTokenToList(refreshtoken, JsonUser, token, config.timeExpRefreshtoken)

      res.status(200).json({
        token: token,
        user: user,
        refreshToken: refreshtoken,
        expToken: config.timeExpToken,
        expRefreshToken: config.timeExpRefreshtoken
      })

    } catch (error) {

      console.log(error);
      res.status(500).json({
        msg: "error"
      })
    }


    // console.log(tokenList);  
    //    res.status(200).json({token:token,user:req.user,refreshToken:refreshtoken})

  },
  forgotPassword: async (req, res, next) => {
    const {
      email
    } = req.body
    const user = await User.findOne({
      email
    })
    if (!user) {
      return res.status({
        msg: "email not found"
      })
    }

    const tokentoChangePassword = await sendConfirmationEmailToChangepassword(user)
    console.log(tokentoChangePassword);
    res.status(200).json({
      tokentoChangePassword,
      msg: "please check your email"
    })
  },
  changePassword: async (req, res, next) => {
    const {
      password,
      passwordConfirm
    } = req.body
    const {
      token
    } = req.params
    const decode = JWT.verify(req.params.token, key.forgottoken);
    console.log(decode);
    if (!password || !passwordConfirm) {
      return res.json({
        msg: "pls enter all field"
      })
    }
    if (!password === passwordConfirm) {
      return res.status(400).json({
        msg: "password and password confirm is diffirent"
      })
    }
    User.findById(decode.sub, (err, doc) => {
      if (err) {
        res.status(400).json({
          msg: "error pls try again"
        })
      }
      doc.password = password;
      doc.save()
    })
    return res.status(200).json({
      msg: "password is change"
    })
  },

  // refreshToken: async (req, res, next) => {
  //   const {
  //     refreshToken
  //   } = req.body;
  //   const expToken = Math.floor(Date.now()) + (config.timeExpToken * 1000)


  //   if (refreshToken) {
  //     clientredis.exists(refreshToken, function (err, exists) {
  //       if (exists) {
  //         let refreshTokenPayload;

  //         JWT.verify(refreshToken, config.refreshtoken, function (err, decoded) {
  //           if (err) {
  //             console.log("el error es: " + err);
  //             return res.status(401).json({
  //               "statusCode": 401,
  //               "error": "Unauthorized",
  //               "msg": err.message,
  //             });
  //           }
  //           refreshTokenPayload = decoded;
  //         });
  //         const payload = {
  //           "_id": refreshTokenPayload.sub
  //         };
  //         const accessToken = signToken(payload, expToken);
  //         const response = {
  //           "access_token": accessToken,
  //           "expires_in": config.timeExpToken

  //         };
  //         updateRefreshTokenfromList(refreshToken, accessToken);
  //         res.status(200).json(response);
  //       } else {
  //         res.status(401).send({
  //           "statusCode": 401,
  //           "error": "Unauthorized",
  //           "message": "The refresh token does not exist",
  //         });
  //       }
  //     });
  //   } else {
  //     res.status(401).send({
  //       "statusCode": 400,
  //       "error": "Bad Request",
  //       "message": "The required parameters were not sent in the request",
  //     });
  //   }
  // },
  // revokeRefreshtoken: (req, res, next) => {
  //   const {
  //     refreshToken
  //   } = req.body;
  //   if (refreshToken) {
  //     client.exists(postData.refreshToken, function (err, exists) {
  //       if (exists) {
  //         console.log('res vale: ' + exists);
  //         removeRefreshTokenfromList(refreshToken);
  //         res.sendStatus(204);
  //       } else {
  //         console.log('The refresh token does not exist');
  //         res.status(401).send({
  //           "statusCode": 401,
  //           "error": "Unauthorized",
  //           "message": "The refresh token does not exist",
  //         });
  //       }
  //     });
  //   } else {
  //     res.status(401).send({
  //       "statusCode": 400,
  //       "error": "Bad Request",
  //       "message": "The required parameters were not sent in the request",
  //     });
  //   }
  // },
  checkToken: async (req, res, next) => {
    console.log(req);
    res.status(200).json({
      mes: "ok"
    })
  },
  banUser: async (req, res, next) => {
    const { id, ban } = req.body
    console.log(id, ban);
    const updateuser = await User.findByIdAndUpdate(id, {
      isBan: ban
    })
    if (!updateuser) {
      res.status(400).json({ msg: "user not found" })
    }
    res.json(updateuser)
  }
  // getFromRedis: async (req, res, next) => {
  //   clientredis.get(req.body.email, (err, data) => {
  //     if (err) throw err;
  //     if (data !== null || undefined) {
  //       res.status(200).json({
  //         refreshToken: data
  //       })
  //     } else {
  //       next()
  //     }
  //   })



  // },
}