const seed = require('../../data/seed.json');

const QUERY = `
SELECT d.id, d.name, d.state, d.lat::float AS lat, d.lng::float AS lng, d.population, d.risk_level,
  h.anaemia::float AS anaemia, h.menstrual_hygiene::float AS menstrual_hygiene,
  h.awareness::float AS awareness, h.menopause_support::float AS menopause_support,
  h.pad_centers, h.clinics, h.programs_count,
  f.sanctioned_cr::float AS funding, f.allocated_cr::float AS allocated, f.utilized_cr::float AS utilized
FROM districts d
JOIN LATERAL (
  SELECT * FROM health_metrics hm
  WHERE hm.district_id = d.id
  ORDER BY record_date DESC, id DESC
  LIMIT 1
) h ON true
JOIN LATERAL (
  SELECT * FROM funding fn
  WHERE fn.district_id = d.id
  ORDER BY fiscal_year DESC, id DESC
  LIMIT 1
) f ON true
ORDER BY d.id;
`;

function mergeTrendFromSeed(mapped) {
  const byId = Object.fromEntries(seed.districts.map((x) => [x.id, x]));
  return mapped.map((d) => ({
    ...d,
    trend: byId[d.id]?.trend || [d.anaemia, d.anaemia, d.anaemia, d.anaemia, d.anaemia, d.anaemia],
  }));
}

function mapRow(r) {
  return {
    id: r.id,
    name: r.name,
    state: r.state,
    lat: r.lat,
    lng: r.lng,
    population: r.population,
    risk: r.risk_level,
    anaemia: r.anaemia,
    menstrualHygiene: r.menstrual_hygiene,
    awareness: r.awareness,
    menopauseSupport: r.menopause_support,
    padCenters: r.pad_centers,
    clinics: r.clinics,
    programs: r.programs_count,
    funding: r.funding,
    allocated: r.allocated,
    utilized: r.utilized,
  };
}

async function loadDistrictsFromPostgres(connectionString) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString, max: 10 });
  try {
    const { rows } = await pool.query(QUERY);
    await pool.end();
    if (!rows.length) throw new Error('No district rows returned');
    return mergeTrendFromSeed(rows.map(mapRow));
  } catch (e) {
    await pool.end().catch(() => {});
    throw e;
  }
}

module.exports = { loadDistrictsFromPostgres };
