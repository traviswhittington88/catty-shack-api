const path = require('path')
const EventEmitter = require('events').EventEmitter
const express = require('express')
const MeowsService = require('./meows-service')
const { requireAuth } = require('../middleware/jwt-auth')
const meowsRouter = express.Router();
const jsonBodyParser = express.json();
const notificationEvent = new EventEmitter;
const meowDeleteEvent = new EventEmitter;

notificationEvent.on('like', function(db, user_name, meow_id) {
  console.log(`meow with id ${meow_id} was just liked!`)
  MeowsService.getById(
    db,
    meow_id 
  )
  .then(meow => {
    if (meow && meow.userhandle !== user_name) {
      const newNotification = {
        recipient: meow.userhandle,
        sender: user_name,
        type: 'like',
        read: false,
        meow_id: meow.meow_id
      }
      MeowsService.createNotification(
        db, 
        newNotification
      )
      .then(() => {
        console.log('Notification created successfully')
      })
      .catch(err => {
        console.log(err)
      })
    }
  })
  .catch(err => {
    console.error(err);
  });
});

notificationEvent.on('comment', function(db, user_name, meow_id) {
  console.log(`meow with id ${meow_id} was just commented on!`)
  MeowsService.getById(
    db,
    meow_id 
  )
  .then(meow => {
    if (meow && meow.userhandle !== user_name) {
      const newNotification = {
        recipient: meow.userhandle,
        sender: user_name,
        type: 'comment',
        read: false,
        meow_id: meow.meow_id
      }
      return MeowsService.createNotification(
        db, 
        newNotification
      )
    }
  })
  .then(() => {
    console.log('notification created sucessfully')
    return;
  })
  .catch(err => {
    console.error(err);
    return;
  });
});

notificationEvent.on('delete', function(db, user_name, meow_id) {
  console.log('delete called')
  console.log(user_name, meow_id)
  MeowsService.removeNotification(
    db,
    user_name,
    meow_id
  )
  .then(() => {
    return;
  })
  .catch(err => {
    console.error(err);
    return;
  })
})
// remove related  comments, likes & notifications when meow is deleted
meowDeleteEvent.on('delete', function(db, meow_id, user_name) {
  console.log(meow_id, user_name)
  MeowsService.getComments(db, meow_id) 
    .then(comments => {
      if (Array.isArray(comments) && comments.length) {
        comments.forEach(comment => {
          MeowsService.deleteComment(db, comment.id)
        })
        console.log('All comments deleted')
      } else {
        console.log('No comments to remove')
        }
    })
    .catch(err => {
      console.log(err) 
    })

    MeowsService.getAllLikes(db, meow_id)
        .then(likes => {
          console.log(likes, likes.length)
          if (Array.isArray(likes) && likes.length) {
            likes.forEach(like => {
              MeowsService.deleteLike(db, like.id)
            })
          } else {
            console.log('No likes to delete for meow')
          }
        })
        .catch(err => {
          console.log(err)
        })

    MeowsService.getNotifications(db, meow_id)
        .then(notifications => {
          console.log(notifications)
          if (Array.isArray(notifications) && notifications.length) {
            notifications.forEach(notification => {
              MeowsService.deleteNotification(db, notification.id)
            })
            console.log('All notifications deleted for this meow')
          } else {
            console.log('No notifications to remove for this meow')
          }
        })
        .then(() => {
          return;
        })
        .catch(err => {
          console.error(err)
        })
  })
    
  
  
// get all meows
// post a meow
meowsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    MeowsService.getAllMeows(req.app.get('db'))
      .then(meows => {
        return res.json(meows.map(MeowsService.serializeMeow))
      })
      .catch(next)
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { body } = req.body
    const userhandle = req.user.user_name
    const tempMeow = { body, userhandle }

    for (const [key, value] of Object.entries(tempMeow)) {
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
    }

    newMeow = {
      body,
      userhandle,
      user_image: req.user.user_image,
      likecount: 0,
      commentcount: 0
    }

    MeowsService.insertMeow(
      req.app.get('db'),
      newMeow
    )
    .then(meow => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${meow.id}`))
        .json(MeowsService.serializeMeow(meow))
    })
    .catch(next)
  })

  // get meow by id
  // delete meow by id
  meowsRouter
    .route('/:meow_id')
    .all(requireAuth)
    .get((req, res, next) => {
      let meowData = {};

      MeowsService.getById(
        req.app.get('db'),
        req.params.meow_id
      )
      .then(meow => {
        if (!meow) {
          res.status(400).json({
            error: {
              message: `Meow does not exist`
            }
          })
        }
        else {
        res.meow = meow
        meowData = meow;
        
        MeowsService.getComments(
          req.app.get('db'),
          req.params.meow_id
        )
        .then(comments => {
          meowData.comments = [];
          comments.forEach(comment => {
            meowData.comments.push(comment);
          });
          return res.json(meowData);
        })
        .catch(err => {
          return res.json({
            error: err.statusText
          })
        })
      }
      })
      .catch(next)
    })
    .delete((req, res, next) => {
      MeowsService.getById(
        req.app.get('db'),
        req.params.meow_id
      )
      .then(meow => {
        if (!meow) {
          return res.status(404).json({
            error: `Sorry that meow does not exist`
          })
        }
        if (meow.userhandle !== req.user.user_name) {
          res.status(400).json({ 
            error: {
              message: `Sorry that meow does not belong to you!`
            }
          })
        } else {
            MeowsService.deleteMeow(
              req.app.get('db'),
              req.params.meow_id
            )
            .then(numOfRowsAffected => {
              meowDeleteEvent.emit('delete', req.app.get('db'), req.params.meow_id, req.user.user_name)
            })
            .then(() => {
              return res.status(204).end()
            })
            .catch(err => {
              return res.status(400).json({
                error: err.statusText
              })
            })
          }
      })
      .catch(next)
    })
    .patch(jsonBodyParser, (req, res, next) => {
      const { body } = req.body
      const updatedMeow = { body }
      const numOfValues = Object.values(updatedMeow).filter(Boolean).length
      if (numOfValues === 0) {
          res.status(400).json({
              error: {
                  message: `Request body must be one of 'body'`
              }
          })
      }

      MeowssService.getById(
        req.app.get('db'),
        req.params.meow_id
      )
      .then(meow => {
        if (meow.user_id.toString() !== user_id.toString()) {
          res.status(400).json({ 
            error: {
              message: `Sorry that meow does not belong to you!`
            }
          })
        } else {
          MeowsService.updateMeow(
            req.app.get('db'),
            req.params.meow_id,
            updatedMeow
          )
          .then(numOfRowsAffected => {
            res.status(204).end()
          })
        }
      })
      .catch(next)  
    })

    // comment on a comment

    meowsRouter
    .route('/:meow_id/comments')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
      if (req.body.body.trim() === '') return res.status(400).json({ error: `Must not be empty` });
      
      const newComment = {
        body: req.body.body,
        meow_id: req.params.meow_id,
        user_name: req.user.user_name,
        user_image: req.user.user_image
      }

      MeowsService.getById(req.app.get('db'), req.params.meow_id)
        .then(meow => {
          if (!meow) {
            return res.status(400).json({ error: `That meow does not exist`})
          }
          return  MeowsService.incrementCommentCount(req.app.get('db'), req.params.meow_id, meow.commentcount + 1);
        })
        .then(() => {
          return MeowsService.addComment(req.app.get('db'), newComment)
        })
        .then(comment => {
          notificationEvent.emit('comment', req.app.get('db'), req.user.user_name, req.params.meow_id)
          return res.json(MeowsService.serializeComment(comment))
        })
        .catch(next)
      })

    // return all likes

    meowsRouter
      .route('/:meow_id/likes')
      .all(requireAuth)
      .get((req, res, next) => {
        MeowsService.getAllLikes(req.app.get('db'), req.params.meow_id)
          .then(likes => {
            if (!likes) {
              return res.status(400).send('no likes for this meow')
            } else {
              return res.status(200).json(likes)
            }
          })
          .catch(error => {
            return res.status(400).json({ 
              error: error.message,
            })
          })
          .catch(next)
      })

    // Like meow

    meowsRouter 
      .route('/:meow_id/like')
      .all(requireAuth)
      .get((req, res, next) => {
        let meowData = {};
        MeowsService.getById(
          req.app.get('db'), 
          req.params.meow_id
          )
          .then(meow => {
            if (meow) {
              meowData = meow;
              meowData.meow_id = meow.meow_id;
              return MeowsService.getLikes(
                req.app.get('db'),
                req.user.user_name,
                req.params.meow_id
              )
            } else {
              return res.status(404).json({ error: `Meow not found` })
            }
          })
          .then(likes => {
            if (!likes) {
              return MeowsService.addLike(
                req.app.get('db'),
                {
                  user_name: req.user.user_name,
                  meow_id: req.params.meow_id
                }
              )
              .then(() => {
                meowData.likecount++
                return MeowsService.incrementLikeCount(req.app.get('db'), req.params.meow_id, meowData.likecount);
              })
              .then(() => {
                notificationEvent.emit('like', req.app.get('db'), req.user.user_name, req.params.meow_id)
                return res.json(meowData);
              })
              .catch(err => {
                res.status(500).json({
                  error: err.statusText
                })
              })
            } else {
              return res.status(400).json({ error: `Meow already liked` })
            }
          })
          .catch(next)
      })

  // unlike meow

  meowsRouter 
  .route('/:meow_id/unlike')
  .all(requireAuth)
  .get((req, res, next) => {
    let meowData = {};
    MeowsService.getById(
      req.app.get('db'), 
      req.params.meow_id
      )
      .then(meow => {
        if (meow) {
          meowData = meow;
          meowData.meow_id = meow.meow_id;
          return MeowsService.getLikes(
            req.app.get('db'),
            req.user.user_name,
            req.params.meow_id
          )
        } else {
          return res.status(404).json({ error: `Meow not found` })
        }
      })
      .then(likes => {
        if (!likes) {
          return res.status(400).json({ error: `Meow not liked` })
          
        } else {
          return MeowsService.removeLike(
            req.app.get('db'), 
            req.user.user_name,
            req.params.meow_id
            )
            .then(() => {
              meowData.likecount--
              return MeowsService.incrementLikeCount(req.app.get('db'), req.params.meow_id, meowData.likecount);
            })
            .then(() => {
              notificationEvent.emit('delete', req.app.get('db'), req.user.user_name, req.params.meow_id)
              return res.json(meowData);
            })
            .catch(err => {
              return res.json({
                error: `Oops something went wrong!`
              })
            })
        }
      })
      .catch(next)
  })
  module.exports = meowsRouter