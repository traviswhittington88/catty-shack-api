const xss = require('xss')

const MeowsService = {
  getAllMeows(db) {
    return db
      .from('meows')
      .orderBy('date_created', 'desc')
      .select('*')
  },
  getMeowsByUserId(db, user_id) {
    return db
      .from('meows')
      .select('*')
      .where({ user_id })
  },
  getById(db, meow_id) {
    return db 
      .select('*')
      .from('meows')
      .where({ meow_id })
      .first()
  },
  insertMeow(db, newMeow) {
    return db
      .insert(newMeow)
      .into('meows')
      .returning('*')
      .then(rows => {
             return rows[0]
      })
  },
  deleteMeow(db, meow_id) {
    return db('meows')
      .where({ meow_id })
      .delete()
  },
  updateMeow(db, meow_id, newMeowFields) {
    return db('meows')
      .where({ meow_id })
      .update(newMeowFields)
  },
  serializeMeow(meow) {
    return {
      meow_id: meow.meow_id,
      userHandle: xss(meow.userhandle),
      body: xss(meow.body),
      date_created: new Date(meow.date_created),
      likeCount: meow.likecount,
      commentCount: meow.commentcount,
    }
  },
  getComments(db, meow_id) {
    return db('comments')
      .select('*')
      .where({ meow_id })
  }
}

module.exports = MeowsService