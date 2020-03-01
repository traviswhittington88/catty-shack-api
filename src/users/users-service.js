const xss = require('xss')
const bcrypt = require('bcryptjs')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
  verifyPassword(password) {
    if (password.length < 8) {
      return `Password must be at least 8 characters`
    }
    if (password.length > 72) {
      return `Password must be less than 73 characters`
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return `Password must not start or end with spaces`
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return `Password must contain 1 upper case, lower case, number and special character`
    }
    return null
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },
  hasUserWithUserName(db, user_name) {
    return db('catshack_users')
      .where({ user_name })
      .first()
      .then(user => !!user)
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('catshack_users')
      .returning('*')
      .then(([user]) => user)
  },
  getUserMeows(db, userhandle) {
    return db('meows')
      .where( { userhandle })
      .select('*')
      .orderBy('date_created', 'desc')
  },
  getUser(db, user_name) {
    return db('catshack_users')
      .where({ user_name })
      .returning('*')
      .then(([user]) => user)
  },
  getUserLikes(db, user_name) {
    console.log('made it to getUserLikes')
    return db('likes')
      .where({ user_name })
      .select('*')
  },
  getUserNotifications(db, recipient) {
    return db('notifications')
      .orderBy('date_created', 'desc')
      .where({ recipient })
      .select('*')
      .limit(10)
  },
  markNotificationRead(db, id) {
    return db('notifications')
      .where({ id })
      .update({ read: true })
  }, 
  insertImage(db, user_name, user_image) {
    return db('catshack_users')
      .where({ user_name })
      .update({ user_image })
      .returning('*')
      .then(([user]) => user)
  },
  reduceUserDetails(data) {
    let userDetails = {}
    if (data.bio.trim()) userDetails.bio = data.bio;
    if (data.website.trim()) {
      // http://website.com
      if (data.website.trim().substring(0, 4) !== 'http') {
        userDetails.website = `http://${data.website.trim()}`;
      } else userDetails.website = data.website;
    }
    if (data.location.trim()) userDetails.location = data.location;

    return userDetails; 
  },
  insertUserDetails(db, user_name, user_details) {
    return db('catshack_users')
      .where({ user_name })
      .update(user_details )
      .returning('*')
      .then(([user]) => user)
  },
  serializeUser(user) {
    return {
      id: user.id,
      user_name: xss(user.user_name),
      date_created: new Date(user.date_created),
      user_image: xss(user.user_image),
      bio: xss(user.bio),
      location: xss(user.location),
      website: xss(user.website)
    }
  }
}

module.exports = UsersService