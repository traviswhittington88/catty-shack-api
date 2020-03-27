const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Meows endpoints', function() {
  let db;

  const { testUsers, testMeows } = helpers.makeCattyShackFixtures;

  before('Make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup tables', () => helpers.cleanTables(db));

  afterEach('cleanup tables', () => helpers.cleanTables(db));

  describe(`GET /api/entries`, () => {
    context(`given no meows`, () => {
      it(`responds with 200 and empty list`, () => {
        return supertest(app).get('/api/entries');
      });
    });
  });
});
