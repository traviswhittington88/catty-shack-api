const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUser() {
  return {
    user: {
      id: 6,
      user_name: 'twhitty89',
      password: '$2a$12$cM2PomvkInPLRHwRT0Uxk.NjWFBw7dMJLu8mStbGh3ofX7CBSJm5m',
      user_image: 'uploads/2020-03-16T19:53:26.746Zgrey-fur-kitten-127028.jpg',
      bio: 'Wittle furry fella',
      location: 'Nunya Bizz',
      website: 'http://furry.com',
      date_created: '2020-03-13T04:40:58.227Z'
    },
    meows: [
      {
        meow_id: 17,
        userhandle: 'twhitty89',
        body: 'Hellllloo\n',
        user_image:
          'uploads/2020-03-16T19:53:26.746Zgrey-fur-kitten-127028.jpg',
        date_created: '2020-03-18T05:59:51.915Z',
        likeCount: 1,
        commentCount: 4
      },
      {
        meow_id: 7,
        userhandle: 'twhitty89',
        body: 'Meow from twhitty89',
        user_image:
          'uploads/2020-03-16T19:53:26.746Zgrey-fur-kitten-127028.jpg',
        date_created: '2020-03-17T00:52:59.841Z',
        likeCount: 0,
        commentCount: 0
      }
    ]
  };
}

function makeUserDetails() {
  return {
    credentials: {
      id: 6,
      user_name: 'twhitty89',
      date_created: '2020-03-13T04:40:58.227Z',
      user_image: 'uploads/2020-03-14T06:21:21.691Zgrey-fur-kitten-127028.jpg',
      bio: 'Wittle furry fella',
      location: 'Nunya Bizz',
      website: 'http://furry.com'
    },
    likes: [
      {
        id: 44,
        user_name: 'twhitty89',
        meow_id: 2
      }
    ],
    notifications: []
  };
}

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      password: 'password',
      user_image: 'uploads/no-img.png',
      bio: 'Small Town Cat',
      location: 'Cheese WI',
      website: 'furryfella.com',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 2,
      user_name: 'test-user-2',
      password: 'password',
      user_image: 'uploads/no-img.png',
      bio: 'just like social media',
      location: 'Stray IL',
      website: 'nunya.com',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 3,
      user_name: 'test-user-3',
      password: 'password',
      user_image: 'uploads/no-img.png',
      bio: 'where am I',
      location: 'Kitty Hawk, NC',
      website: 'whoknows.com',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 4,
      user_name: 'test-user-4',
      password: 'password',
      user_image: 'uploads/no-img.png',
      bio: 'Lazy cat who lays by the lattice',
      location: 'Sunny CA',
      website: 'peacekittens.com',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    }
  ];
}

function makeNotificationsArray() {
  return [
    {
      id: 1,
      recipient: 'twhitty89',
      sender: 'test-user-2',
      read: false,
      meow_id: 17,
      type: 'like',
      date_created: new Date('2020-02-22T16:28:33.617Z')
    },
    {
      id: 2,
      recipient: 'test-user-1',
      sender: 'test-user-2',
      read: false,
      meow_id: 1,
      type: 'comment',
      date_created: new Date('2020-02-22T16:28:33.617Z')
    },
    {
      id: 1,
      recipient: 'test-user-2',
      sender: 'test-user-3',
      read: false,
      meow_id: 2,
      type: 'like',
      date_created: new Date('2020-02-22T16:28:33.617Z')
    },
    {
      id: 1,
      recipient: 'test-user-3',
      sender: 'test-user-4',
      read: false,
      meow_id: 3,
      type: 'comment',
      date_created: new Date('2020-02-22T16:28:33.617Z')
    }
  ];
}

function makeCommentsArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      meow_id: 1,
      body: 'what a great meow , I wish I said that',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      user_image: 'images/no-img.png'
    },
    {
      id: 2,
      user_name: 'test-user-2',
      meow_id: 1,
      body: 'what a great meow , I wish I said that',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      user_image: 'images/no-img.png'
    }
  ];
}

function makeMeowsArray() {
  return [
    {
      meow_id: 1,
      userHandle: 'test-user-1',
      body: 'woo haaaaa',
      user_image: 'images/no-image.png',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      likeCount: 0,
      commentCount: 0
    },
    {
      meow_id: 2,
      userHandle: 'test-user-2',
      body: 'love the post bro',
      user_image: 'images/no-image.png',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      likeCount: 0,
      commentCount: 0
    },
    {
      meow_id: 3,
      userHandle: 'test-user-3',
      body: 'nice comment!',
      user_image: 'images/no-image.png',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      likeCount: 0,
      commentCount: 0
    },
    {
      meow_id: 4,
      userHandle: 'test-user-4',
      body: 'fun place!',
      user_image: 'images/no-image.png',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      likeCount: 0,
      commentCount: 0
    },
    {
      meow_id: 5,
      userHandle: 'test-user-5',
      body: 'Hey!',
      user_image: 'images/no-image.png',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      likeCount: 0,
      commentCount: 0
    }
  ];
}

function makeLikesArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      meow_id: 1
    },
    {
      id: 2,
      user_name: 'test-user-2',
      meow_id: 1
    },
    {
      id: 3,
      user_name: 'test-user-3',
      meow_id: 1
    },
    {
      id: 4,
      user_name: 'test-user-4',
      meow_id: 1
    }
  ];
}

function makeCattyShackFixtures() {
  const testMeows = makeMeowsArray();
  const testUsers = makeUsersArray();
  const testLikes = makeLikesArray();
  const testComments = makeCommentsArray();
  const testNotifications = makeNotificationsArray();
  return { testUsers, testMeows, testLikes, testComments, testNotifications };
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx
      .raw(
        `TRUNCATE
        catshack_users,
        meows,
        likes,
        comments,
        notifications
      `
      )
      .then(() =>
        Promise.all([
          trx.raw(
            `ALTER SEQUENCE catshack_users_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`ALTER SEQUENCE meows_meow_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE likes_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE comments_id_seq minvalue 0 START WITH 1`),
          trx.raw(
            `ALTER SEQUENCE notifications_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`SELECT setval('catshack_users_id_seq', 0)`),
          trx.raw(`SELECT setval('meows_meow_id_seq', 0)`),
          trx.raw(`SELECT setval('likes_id_seq', 0)`),
          trx.raw(`SELECT setval('comments_id_seq', 0)`),
          trx.raw(`SELECT setval('notifications_id_seq', 0)`)
        ])
      )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into('catshack_users')
    .insert(preppedUsers)
    .then(() =>
      //update the auto sequence to stay in sync
      db.raw(`SELECT setval('catshack_users_id_seq', ?)`, [
        users[users.length - 1].id
      ])
    );
}

function seedCattyShackTables(
  db,
  users,
  meows = [],
  likes,
  comments,
  notifications
) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    if (meows.length) {
      await trx.into('meows').insert(meows);
      await trx.raw(`SELECT setval('meow_id_seq', ?)`, [
        meows[meows.length - 1].id
      ]);
    }
    await trx.into('likes').insert(likes);
    // update the auto sequence to match the forced id values
    await trx.raw(`SELECT setval('likes_id_seq', ?)`, [
      likes[likes.length - 1].id
    ]);
    await trx.into('comments').insert(comments);
    // update the auto sequence to match the forced id values
    await trx.raw(`SELECT setval('comments_id_seq', ?)`, [
      comments[comments.length - 1].id
    ]);
    await trx.into('notifications').insert(notifications);
    // update the auto sequence to match the forced id values
    await trx.raw(`SELECT setval('notifications_id_seq', ?)`, [
      notifications[notifications.length - 1].id
    ]);
  });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256'
  });

  return `Bearer ${token}`;
}

module.exports = {
  makeUser,
  makeUserDetails,
  makeUsersArray,
  makeMeowsArray,
  makeCommentsArray,
  makeCattyShackFixtures,
  cleanTables,
  seedCattyShackTables,
  seedUsers,
  makeAuthHeader
};
