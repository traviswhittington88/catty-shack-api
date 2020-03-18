const xss = require('xss');

const MeowsService = {
  getAllMeows(db) {
    return db
      .from('meows')
      .orderBy('date_created', 'desc')
      .select('*');
  },
  getMeowsByUserId(db, user_id) {
    return db
      .from('meows')
      .select('*')
      .where({ user_id });
  },
  getById(db, meow_id) {
    return db
      .select('*')
      .from('meows')
      .where({ meow_id })
      .first();
  },
  insertMeow(db, newMeow) {
    return db
      .insert(newMeow)
      .into('meows')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteMeow(db, meow_id) {
    return db('meows')
      .where({ meow_id })
      .delete();
  },
  updateMeowImage(db, userhandle, user_image) {
    return db('meows')
      .where('userhandle', userhandle)
      .update('user_image', user_image)
      .then(() => {
        return;
      });
  },
  updateCommentsImage(db, user_name, user_image) {
    return db('comments')
      .where('user_name', user_name)
      .update('user_image', user_image)
      .then(() => {
        return;
      });
  },
  serializeMeow(meow) {
    return {
      meow_id: meow.meow_id,
      userHandle: xss(meow.userhandle),
      body: xss(meow.body),
      user_image: xss(meow.user_image),
      date_created: new Date(meow.date_created),
      likeCount: meow.likecount,
      commentCount: meow.commentcount
    };
  },
  serializeComment(comment) {
    return {
      user_name: xss(comment.user_name),
      meow_id: comment.meow_id,
      body: xss(comment.body),
      date_created: comment.date_created,
      user_image: xss(comment.user_image)
    };
  },
  getComments(db, meow_id) {
    return db('comments')
      .select('*')
      .where({ meow_id })
      .orderBy('date_created', 'desc');
  },
  addComment(db, newComment) {
    return db('comments')
      .insert(newComment)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getLikes(db, user_name, meow_id) {
    return db('likes')
      .select('*')
      .where({
        user_name: user_name,
        meow_id: meow_id
      })
      .first();
  },
  getAllLikes(db, meow_id) {
    return db('likes')
      .select('*')
      .where({ meow_id });
  },
  addLike(db, newLike) {
    return db('likes')
      .insert(newLike)
      .return('*')
      .then(rows => {
        return rows[0];
      });
  },
  incrementCommentCount(db, meow_id, commentcount) {
    return db('meows')
      .where({ meow_id })
      .update({ commentcount });
  },
  incrementLikeCount(db, meow_id, likecount) {
    return db('meows')
      .where({ meow_id })
      .update({ likecount });
  },
  removeLike(db, user_name, meow_id) {
    return db('likes')
      .where({ user_name, meow_id })
      .delete();
  },
  deleteLike(db, id) {
    return db('likes')
      .where({ id })
      .delete()
      .then(() => {
        return;
      });
  },
  decrementLikeCount(db, meow_id, likecount) {
    return db('meows')
      .where({ meow_id })
      .update({ likecount });
  },
  getNotifications(db, meow_id) {
    return db('notifications')
      .select('*')
      .where({ meow_id });
  },
  createNotification(db, newNotification) {
    return db('notifications')
      .insert(newNotification)
      .return('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteNotification(db, id) {
    return db('notifications')
      .where({ id })
      .delete()
      .then(() => {
        return;
      });
  },
  removeNotification(db, sender, meow_id) {
    return db('notifications')
      .where({
        sender,
        meow_id,
        type: 'like'
      })
      .delete();
  },
  deleteComment(db, id) {
    return db('comments')
      .where({ id })
      .delete()
      .then(() => {
        return;
      });
  }
};

module.exports = MeowsService;
