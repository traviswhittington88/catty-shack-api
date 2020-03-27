const knex = require('knex');
const jwt = require('jsonwebtoken');
const helpers = require('./test-helpers');
const app = require('../src/app');

describe('Auth endpoints', () => {
  let db;
  const { testUsers } = helpers.makeCattyShackFixtures();
  const testUser = testUsers[0];
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

  describe('POST /api/auth/login', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    const requiredFields = ['user_name', 'password'];

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        user_name: testUser.user_name,
        password: testUser.password
      };

      it(`responds 400 required error when ${field} is missing`, () => {
        delete loginAttemptBody[field];
        console.log(loginAttemptBody);
        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });

    it(`responds 400 'Incorrect user_name or password' when bad user_name`, () => {
      const userInvalidUserName = {
        user_name: 'wrong-user',
        password: testUser.password
      };

      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidUserName)
        .expect(400, {
          error: `Incorrect user_name or password`
        });
    });

    it(`responds 400 'Incorrect user_name or password' when bad password`, () => {
      const userInvalidPass = {
        user_name: testUser.user_name,
        password: 'incorrect'
      };
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidPass)
        .expect(400, {
          error: `Incorrect user_name or password`
        });
    });

    it(`responds 200 and JWT token using secret when valid credentials`, () => {
      const userValidCreds = {
        user_name: testUser.user_name,
        password: testUser.password
      };
      const expectedToken = jwt.sign(
        { id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.user_name,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256'
        }
      );
      return supertest(app)
        .post('/api/auth/login')
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken,
          id: 1,
          user_image: 'uploads/no-img.png',
          userhandle: 'test-user-1'
        });
    });
  });

  describe(`POST /api/auth/refresh`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    it(`responds with 200 and JWT auth token using secret`, () => {
      const expectedToken = jwt.sign(
        { user_id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.user_name,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256'
        }
      );
      return supertest(app)
        .post('/api/auth/refresh')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, {
          authToken: expectedToken
        });
    });
  });
});
