const axios = require('axios');

const baseURL = () => (process.env.ML_SERVICE_URL || '').replace(/\/$/, '');

async function postSimulate(body) {
  const b = baseURL();
  if (!b) return null;
  try {
    const { data } = await axios.post(`${b}/analytics/simulate`, body, { timeout: 8000 });
    return data;
  } catch (e) {
    console.warn('ML simulate fallback:', e.message);
    return null;
  }
}

async function postRecommendations(districtPayload) {
  const b = baseURL();
  if (!b) return null;
  try {
    const { data } = await axios.post(`${b}/analytics/recommendations`, districtPayload, { timeout: 8000 });
    return data;
  } catch (e) {
    console.warn('ML recommendations fallback:', e.message);
    return null;
  }
}

async function postMenopauseAssess(body) {
  const b = baseURL();
  if (!b) return null;
  try {
    const { data } = await axios.post(`${b}/analytics/menopause/assess`, body, { timeout: 8000 });
    return data;
  } catch (e) {
    console.warn('ML menopause fallback:', e.message);
    return null;
  }
}

module.exports = { postSimulate, postRecommendations, postMenopauseAssess };
