const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const EventEmitter = require('events').EventEmitter;
const UsersService = require('../users/users-service');
const MeowsService = require('../meows/meows-service');
const path = require('path');
const multer = require('multer');
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
    });
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
    fileFilter: fileFilter
  }
});

const usersRouter = express.Router();
const jsonBodyParser = express.json();
const changeImageEvent = new EventEmitter();

changeImageEvent.on('update', function(db, userhandle, newImage) {
  UsersService.getUser(db, userhandle)
    .then(user => {
      if (user && user.user_image === newImage) {
        MeowsService.updateMeowImage(db, userhandle, newImage)
          .then(() => {
            MeowsService.updateCommentsImage(db, userhandle, newImage);
          })
          .catch(err => {
            console.error(err);
          });
      }
    })
    .catch(err => {
      console.error(err);
    });
});

usersRouter.post('/', jsonBodyParser, (req, res, next) => {
  const { user_name, password } = req.body;

  for (const field of ['user_name', 'password'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing ${field} in request body`
      });

  const passwordError = UsersService.verifyPassword(password);

  if (passwordError) {
    return res.status(400).json({
      error: passwordError
    });
  }

  UsersService.hasUserWithUserName(req.app.get('db'), user_name)
    .then(hasUserWithUserName => {
      if (hasUserWithUserName) {
        return res.status(400).json({
          error: `Username already taken`
        });
      }
      return UsersService.hashPassword(password).then(hashedPassword => {
        const newUser = {
          user_name,
          password: hashedPassword,
          user_image: 'uploads/no-img.png', //could possibly be just no-img.png without uploads.. may not matter
          date_created: 'now()'
        };
        return UsersService.insertUser(req.app.get('db'), newUser).then(
          user => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(UsersService.serializeUser(user));
          }
        );
      });
    })
    .catch(next);
});

// upload profile image for user
usersRouter
  .route('/image')
  .all(requireAuth)
  .post(jsonBodyParser, upload.single('profileImage'), (req, res, next) => {
    UsersService.insertImage(
      req.app.get('db'),
      req.user.user_name,
      req.file.path
    )
      .then(user => {
        changeImageEvent.emit(
          'update',
          req.app.get('db'),
          user.user_name,
          user.user_image
        ); //updates image url in all tables containing the image
        return res.status(201).json(UsersService.serializeUser(user));
      })
      .catch(err => {
        return res.status(500).json({
          error: `Something went wrong`
        });
      })
      .catch(next);
  });

// Add user details

usersRouter
  .route('/details')
  .all(requireAuth)
  .get((req, res, next) => {
    let userData = {};
    UsersService.getUser(req.app.get('db'), req.user.user_name).then(user => {
      if (!user) {
        return res.status(400).json({
          error: `That user does not exist`
        });
      } else {
        userData.credentials = UsersService.serializeUser(user);
        UsersService.getUserLikes(req.app.get('db'), req.user.user_name)
          .then(data => {
            console.log(data);
            userData.likes = [];
            data.forEach(element => {
              userData.likes.push(element);
            });

            return UsersService.getUserNotifications(
              req.app.get('db'),
              req.user.user_name
            );
          })
          .then(data => {
            userData.notifications = [];
            data.forEach(data => {
              userData.notifications.push({
                recipient: data.recipient,
                sender: data.sender,
                read: data.read,
                meow_id: data.meow_id,
                type: data.type,
                date_created: data.date_created,
                id: data.id
              });
            });
            return res.status(200).json(userData);
          })
          .catch(err => {
            res.status(400).json({
              error: err.statusText
            });
          });
      }
    });
  })
  .post(jsonBodyParser, (req, res, next) => {
    let userDetails = UsersService.reduceUserDetails(req.body);
    UsersService.insertUserDetails(
      req.app.get('db'),
      req.user.user_name,
      userDetails
    ).then(user => {
      if (!user) {
        return res.status(400).json({
          error: `That user does not exist, try again`
        });
      } else {
        res.status(201).json(UsersService.serializeUser(user));
      }
    });
  });

usersRouter.route('/:user_name').get((req, res, next) => {
  let userData = {};
  UsersService.getUser(req.app.get('db'), req.params.user_name)
    .then(user => {
      if (!user) {
        return res.status(400).json({
          error: `That user does not exist`
        });
      } else {
        userData.user = UsersService.serializeUser(user);
        return UsersService.getUserMeows(
          req.app.get('db'),
          req.params.user_name
        );
      }
    })
    .then(meows => {
      userData.meows = [];
      meows.forEach(meow => {
        userData.meows.push({
          meow_id: meow.meow_id,
          userHandle: meow.userhandle,
          body: meow.body,
          user_image: meow.user_image,
          date_created: meow.date_created,
          likeCount: meow.likecount,
          commentCount: meow.commentcount
        });
      });
      console.log(userData);
      return res.json(userData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.statusText
      });
    })
    .catch(next);
});

usersRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    let userData = {};
    console.log(req.user.user_name);
    UsersService.getUser(req.app.get('db'), req.user.user_name)
      .then(user => {
        if (!user) {
          return res.status(400).json({
            error: `That user does not exist`
          });
        } else {
          userData.user = UsersService.serializeUser(user);
          return UsersService.getUserMeows(
            req.app.get('db'),
            req.user.user_name
          );
        }
      })
      .then(meows => {
        userData.meows = [];
        meows.forEach(meow => {
          userData.meows.push({
            meow_id: meow.meow_id,
            userhandle: meow.userhandle,
            body: meow.body,
            user_image: meow.user_image,
            date_created: meow.date_created,
            likeCount: meow.likecount,
            commentCount: meow.commentcount
          });
        });
        return res.json(userData);
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({
          error: err.statusText
        });
      })
      .catch(next);
  });

usersRouter
  .route('/notifications')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    req.body.forEach(notificationId => {
      UsersService.markNotificationRead(req.app.get('db'), notificationId)
        .then(() => {
          return;
        })
        .catch(err => {
          console.error(err);
          return res.json({
            error: err.statusText
          });
        });
    });
    return res.json(`Notifications marked read`);
  });

module.exports = usersRouter;
