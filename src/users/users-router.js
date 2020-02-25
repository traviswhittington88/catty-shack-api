const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const UsersService = require('../users/users-service')
const path = require('path')
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function(req, res, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    res.json({
      error: `Wrong file type submitted. Upload only .png or .jpeg`
    })
    cb(null, false);
  }
}

const upload = multer({ storage: storage, limits: {
  fileSize: 1024 * 1024 * 5,
  fileFilter: fileFilter
} })



const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { user_name, password } = req.body

    for (const field of ['user_name', 'password'])
      if (!req.body[field]) 
        return res.status(400).json({
          error: `Missing ${field} in request body`,
        })
    
    const passwordError = UsersService.verifyPassword(password)

    if (passwordError) {
      return res.status(400).json({
        error: passwordError
      })
    }

    UsersService.hasUserWithUserName(
      req.app.get('db'),
      user_name
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName) {
          return res.status(400).json({
            error: `Username already taken`
          })
        }
          return UsersService.hashPassword(password)
            .then(hashedPassword => {
              const newUser = {
                user_name,
                password: hashedPassword,
                user_image: 'uploads/no-img.png',
                date_created: 'now()',
              }
              return UsersService.insertUser(
                req.app.get('db'),
                newUser
              )
                .then(user => {
                  
                  res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                    .json(UsersService.serializeUser(user))
                })
            })
          })
      .catch(next)
    })

  // upload profile image for user
  usersRouter
    .route('/image')
    .all(requireAuth)
    .post(jsonBodyParser, upload.single('profileImage'), (req, res, next) => {   
      UsersService.insertImage(
        req.app.get('db'),
        req.user.user_name,
        req.file.path,
      )
      .then(user => {
        res.status(201)
        .json(UsersService.serializeUser(user))
      }) 
    })

  // Add user details
  
  usersRouter
    .route('/details')
    .all(requireAuth)
    .get((req, res, next) => {
      let userData = {}
      UsersService.getUser(req.app.get('db'), req.user.user_name)
        .then(user => {
          if (!user) {
            return res.status(400).json({
              error: `That user does not exist`
            })
          } else {
            userData.credentials = UsersService.serializeUser(user)
            UsersService.getUserLikes(req.app.get('db'), req.user.user_name)
              .then(data => {
                console.log(data)
                userData.likes = [];
                data.forEach(element => {
                  userData.likes.push(element)
                })
                console.log(userData)
                return res.status(200).json(userData);
              })
              .catch(err => {
                res.status(400).json({
                  error: err.statusText
                })
              })

          }
        })

    })
    .post(jsonBodyParser, (req, res, next) => {

      let userDetails = UsersService.reduceUserDetails(req.body);
      UsersService.insertUserDetails(
        req.app.get('db'),
        req.user.user_name,
        userDetails
        )
        .then(user => {
          if (!user) {
            return res.status(400).json({
              error: `That user does not exist, try again`
            })
          } else {
            res
              .status(201)
              .json(UsersService.serializeUser(user))
          }
        })
    })



  module.exports = usersRouter