const knex = require('knex');
const jwt = require('jsonwebtoken');
const helpers = require('./test-helpers');
const app = require('../src/app');

describe(`Protected endpoints`, () => {
  let db;

  const {
    testUsers,
    testUser,
    testMeows,
    testLikes,
    testComments,
    testNotifications
  } = helpers.makeCattyShackFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  beforeEach(`Insert meows, users, likes, comments and notifications`, () =>
    helpers.seedCattyShackTables(
      db,
      testUsers,
      testMeows,
      testLikes,
      testComments,
      testNotifications
    )
  );

  const protectedEndpoints = [
    {
      name: 'GET /api/meows/:meow_id',
      path: '/api/meows/1'
    },
    {
      name: 'GET /api/users/details',
      path: '/api/users/details'
    },
    {
      name: 'GET /api/meows/:meow_id/comments',
      path: '/api/meows/1/comments'
    },
    {
      name: 'GET /api/meows/:meow_id/likes',
      path: '/api/meows/1/likes'
    },
    {
      name: 'GET /api/meows/:meow_id/like',
      path: '/api/meows/1/like'
    },
    {
      name: 'GET /api/meows/:meow_id/unlike',
      path: '/api/meows/1/unlike'
    }
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it(`Responds with 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
          .get(endpoint.path)
          .expect(401, { error: `Missing bearer token` });
      });

      it(`responds 401 'Unauthorized request' when invalid JTW secret in token`, () => {
        const validUser = testUsers[0];
        const invalidSecret = 'bad-secret';
        return supertest(app)
          .get(endpoint.path)
          .set(
            'Authorization',
            helpers.makeAuthHeader(validUser, invalidSecret)
          ) //token made by service based on bad secret
          .expect(401, { error: `Unauthorized request` }); //comes from jwt-auth middleware
      });

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { user_name: 'user-not', id: 1 };
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: 'Unauthorized request' });
      });
    });
  });
});
