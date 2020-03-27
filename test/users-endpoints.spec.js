const knex = require('knex');
const bcrypt = require('bcryptjs'); //to test passwords were successfully hashed
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users endpoints', function() {
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

  describe('POST /api/users', () => {
    context('User validation', () => {
      beforeEach('insert users', () => {
        helpers.seedUsers(db, testUsers);
      });

      const requiredFields = ['user_name', 'password'];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          user_name: 'user_name',
          password: 'password'
        };

        it(`responds with 400 required error when ${field} is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing ${field} in request body`
            });
        });
      });

      it(`responds 400 and 'Password must be at least 8 characters' when password short`, () => {
        const userShortPass = {
          user_name: 'test user_name',
          password: '1234567'
        };

        return supertest(app)
          .post('/api/users')
          .send(userShortPass)
          .expect(400, {
            error: `Password must be at least 8 characters`
          });
      });

      it(`responds 400 and 'Password must be less than 73 characters' when password long`, () => {
        const userLongPass = {
          user_name: 'test user_name',
          password: '*'.repeat(73)
        };

        return supertest(app)
          .post('/api/users')
          .send(userLongPass)
          .expect(400, {
            error: `Password must be less than 73 characters`
          });
      });

      it(`responds 400 error when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          user_name: 'test user_Name',
          password: '  11AAaa!!'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordStartsSpaces)
          .expect(400, {
            error: `Password must not start or end with spaces`
          });
      });

      it(`responds with 400 error when password ends with spaces`, () => {
        const userPasswordEndsSpaces = {
          user_name: 'test user_name',
          password: 'aa!!BB1234 '
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordEndsSpaces)
          .expect(400, {
            error: `Password must not start or end with spaces`
          });
      });

      it(`responds 400 error when password isn't complex enought`, () => {
        const userPasswordNotComplex = {
          user_name: 'test user_name',
          password: '11AAaabb'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordNotComplex)
          .expect(400, {
            error: `Password must contain 1 upper case, lower case, number and special character`
          });
      });

      /*it(`responds 400 'User name already taken' when user_name isn't unique`, () =>  {
        const duplicateUser = {
          user_name: testUser.user_name,
          password: 'aaAA11!!'
        };
        return supertest(app)
          .post('/api/users')
          .send(duplicateUser)
          .expect(400, {
            error: `Username already taken`
          }); 
      }); */
    });

    context(`Happy path`, () => {
      it(`responds 201, serialized user, storing bcrypted password`, () => {
        const newUser = {
          user_name: 'test user_name',
          password: 'AAaa11!!'
        };
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.user_name).to.eql(newUser.user_name);
            expect(res.body).to.not.have.property('password');
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
            const expectedDate = new Date().toLocaleString('en', {
              timeZone: 'UTC'
            });
            const actualDate = new Date(res.body.date_created).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
          })
          .expect(res =>
            db
              .from(testUsers)
              .select('*')
              .where({ id: res.body.id })
              .then(row => {
                expect(row.user_name).to.eql(newUser.user_name);
                const expectedDate = new Date().toLocaleString('en', {
                  timeZone: 'UTC'
                });
                const actualDate = new Date(row.date_created).toLocaleString();
                expect(actualDate).to.eql(expectedDate);

                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });
});
