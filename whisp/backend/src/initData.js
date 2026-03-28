const seed = require('../data/seed.json');
const { loadDistrictsFromPostgres } = require('./db/postgresDistricts');
const { createReportsStore } = require('./services/reportsStore');
const state = require('./state');

async function loadDistricts() {
  if (process.env.DATABASE_URL) {
    try {
      const fromDb = await loadDistrictsFromPostgres(process.env.DATABASE_URL);
      console.log('Districts loaded from PostgreSQL');
      return fromDb;
    } catch (e) {
      console.warn('PostgreSQL unavailable, using seed file:', e.message);
    }
  }
  return seed.districts;
}

async function bootstrap() {
  const districts = await loadDistricts();
  state.setDistricts(districts);

  const reportsStore = await createReportsStore(seed.reports);
  const initialReports = await reportsStore.findAll({});
  state.setReports(initialReports);

  return { reportsStore };
}

module.exports = { bootstrap, loadDistricts };
