const path = require('path')
const express = require('express')
const MeowsService = require('../meows/meows-service')
const { requireAuth } = require('../middleware/jwt-auth')

const meowsRouter = express.Router();
const jsonBodyParser = express.json();

meowsRouter
  .route('/')
  .get((req, res, next) => {
    MeowsService.getAllMeows(req.app.get('db'))
      .then(meows => {
        res.json(meows.map(MeowsService.serializeMeow))
      })
      .catch(next)
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { body, userhandle } = req.body
    const newMeow = { body, userhandle } 

    for (const [key, value] of Object.entries(newMeow)) {
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
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
    //.all(requireAuth)
    .get((req, res, next) => {
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
        next()
      })
      .catch(next)
    })
    .get((req, res, next) => {
      res.json(MeowsService.serializeMeow(res.meow))
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

  module.exports = meowsRouter