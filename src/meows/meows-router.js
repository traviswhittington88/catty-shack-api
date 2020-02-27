const path = require('path')
const express = require('express')
const MeowsService = require('../meows/meows-service')
const { requireAuth } = require('../middleware/jwt-auth')

const meowsRouter = express.Router();
const jsonBodyParser = express.json();

meowsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    MeowsService.getAllMeows(req.app.get('db'))
      .then(meows => {
        res.json(meows.map(MeowsService.serializeMeow))
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
      })
      .catch(next)
    })
    .delete((req, res, next) => {
      MeowsService.getById(
        req.app.get('db'),
        req.params.meow_id
      )
      .then(meow => {
        if (meow.user_id.toString() !== req.get('user_id').toString()) {
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
            res.status(204).end()
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
          return res.json(MeowsService.serializeComment(comment))
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
                console.log(meowData)
                return MeowsService.incrementLikeCount(req.app.get('db'), req.params.meow_id, meowData.likecount);
              })
              .then(() => {
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
          console.log(meow)
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
        console.log(likes)
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
              console.log(meowData)
              return MeowsService.incrementLikeCount(req.app.get('db'), req.params.meow_id, meowData.likecount);
            })
            .then(() => {
              return res.json(meowData);
            })
            .catch(err => {
              console.error(err.code)
              return res.json({
                error: err.statusText
              })
            })
        }
      })
      .catch(next)
  })
  module.exports = meowsRouter