const xss = require('xss')

const MeowsService = {
  getAllMeows(db) {
    return db
      .from('meows')
      .select('*')
  },
  getMeowsByUserId(db, journal_id) {
    return db
      .from('meows')
      .select('*')
      .where({ journal_id })
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
  deleteMeow(db, id) {
    return db('meows')
      .where({ id })
      .delete()
  },
  updateMeow(db, id, newMeowFields) {
    return db('meows')
      .where({ id })
      .update(newMeowFields)
  },
  serializeMeow(meow) {
    return {
      userHandle: xss(meow.userhandle),
      body: xss(meow.body),
      date_created: new Date(meow.date_created),
      likeCount: meow.likecount,
      commentCount: meow.commentcount,
    }
  }
}

module.exports = MeowsService