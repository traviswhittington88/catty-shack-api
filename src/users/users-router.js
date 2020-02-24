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
        console.log(user)
        res.end();
      }) 
    });


  module.exports = usersRouter