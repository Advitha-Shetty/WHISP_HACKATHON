const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const state = require('../state');
const analytics = require('../lib/analytics');
const { cacheGet, cacheSet, cacheDel } = require('../services/redisCache');
const mlClient = require('../services/mlClient');

const DISTRICTS_CACHE = 'whisp:districts:v1';

function districtToMlPayload(d) {
  return {
    id: d.id,
    name: d.name,
    anaemia: d.anaemia,
    menstrualHygiene: d.menstrualHygiene,
    awareness: d.awareness,
    menopauseSupport: d.menopauseSupport,
    funding: d.funding,
    allocated: d.allocated,
    utilized: d.utilized,
    population: d.population,
  };
}

function registerRoutes(app, reportsStore) {
  const { authMiddleware, govOnly } = require('../middleware/auth');

  function enrichDistrict(d) {
    const reps = state.getReports();
    const adj = analytics.calcAdjustedWHI(d, reps);
    return {
      ...d,
      whi: adj.adjustedWHI,
      whiBase: adj.baseWHI,
      openCitizenReports: adj.openReportCount,
      whiPenaltyFromReports: adj.penaltyPoints,
      tri: analytics.calcTRI(d),
      leakageDetected: analytics.detectLeakage(d),
    };
  }

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    const user = state.getUsers().find((u) => u.email === email);
    if (!user || !bcrypt.compareSync(password || '', user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const secret = app.get('jwtSecret');
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '24h' }
    );
    return res.json({
      token,
      role: user.role,
      email: user.email,
      name: user.name,
    });
  });

  app.get('/api/districts', async (req, res) => {
    try {
      const bypass = req.query.nocache === '1';
      if (!bypass) {
        const cached = await cacheGet(DISTRICTS_CACHE);
        if (cached) return res.json(cached);
      }
      const list = state.getDistricts().map(enrichDistrict);
      await cacheSet(DISTRICTS_CACHE, list, Number(process.env.CACHE_TTL_SEC || 60));
      return res.json(list);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/districts/:id', async (req, res) => {
    const d = state.getDistricts().find((x) => x.id === parseInt(req.params.id, 10));
    if (!d) return res.status(404).json({ error: 'District not found' });
    return res.json(enrichDistrict(d));
  });

  app.get('/api/health-score', async (req, res) => {
    const reps = state.getReports();
    const scores = state.getDistricts().map((d) => {
      const adj = analytics.calcAdjustedWHI(d, reps);
      return {
        id: d.id,
        name: d.name,
        whi: adj.adjustedWHI,
        whiBase: adj.baseWHI,
        tri: analytics.calcTRI(d),
        risk: d.risk,
        leakageDetected: analytics.detectLeakage(d),
        openCitizenReports: adj.openReportCount,
        metrics: {
          anaemia: d.anaemia,
          menstrualHygiene: d.menstrualHygiene,
          awareness: d.awareness,
          menopauseSupport: d.menopauseSupport,
        },
      };
    });
    return res.json(scores);
  });

  app.get('/api/health-score/:id/explain', (req, res) => {
    const d = state.getDistricts().find((x) => x.id === parseInt(req.params.id, 10));
    if (!d) return res.status(404).json({ error: 'Not found' });
    const reps = state.getReports();
    const adj = analytics.calcAdjustedWHI(d, reps);
    const reasons = analytics.explainRisk(d, reps);
    return res.json({
      district: d.name,
      risk: d.risk,
      whi: adj.adjustedWHI,
      whiBase: adj.baseWHI,
      tri: analytics.calcTRI(d),
      thematicImbalance: analytics.calcTRI(d) > 15,
      reasons,
      summary:
        reasons.length > 0
          ? `Elevated risk driven by: ${reasons.slice(0, 3).join('; ')}`
          : 'No critical rule-based triggers; maintain surveillance.',
    });
  });

  app.get('/api/reports', authMiddleware, govOnly, async (req, res) => {
    const { district, status } = req.query;
    const list = await reportsStore.findAll({ district, status });
    return res.json(list);
  });

  app.post('/api/reports', async (req, res) => {
    const { district, type, description, location } = req.body || {};
    if (!district || !type) {
      return res.status(400).json({ error: 'district and type required' });
    }
    const report = await reportsStore.insert({ district, type, description, location });
    const all = await reportsStore.findAll({});
    state.setReports(all);
    await cacheDel(DISTRICTS_CACHE);
    return res.status(201).json({ message: 'Report submitted anonymously', id: report.id });
  });

  app.patch('/api/reports/:id/status', authMiddleware, govOnly, async (req, res) => {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: 'status required' });
    const updated = await reportsStore.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Report not found' });
    state.setReports(await reportsStore.findAll({}));
    await cacheDel(DISTRICTS_CACHE);
    return res.json(updated);
  });

  app.post('/api/simulation', authMiddleware, govOnly, async (req, res) => {
    const { districtId, extraFunding = 0, extraPrograms = 0 } = req.body || {};
    const d = state.getDistricts().find((x) => x.id === Number(districtId));
    if (!d) return res.status(404).json({ error: 'District not found' });
    const reps = state.getReports();
    const current = analytics.calcAdjustedWHI(d, reps).adjustedWHI;

    const mlBody = {
      district_id: d.id,
      current_whi: current,
      extra_funding: Number(extraFunding) || 0,
      extra_programs: Number(extraPrograms) || 0,
    };
    const ml = await mlClient.postSimulate(mlBody);
    if (ml && ml.projected_whi != null) {
      return res.json({
        district: d.name,
        base: ml.base_whi,
        newScore: ml.projected_whi,
        delta: ml.delta,
        awarenessGain: ml.breakdown?.awareness_gain,
        hygieneGain: ml.breakdown?.hygiene_gain,
        anaemiaGain: ml.breakdown?.anaemia_reduction,
        menopauseGain: ml.breakdown?.menopause_gain,
        model: ml.model_version || 'fastapi-ml',
        source: 'ml-service',
      });
    }

    const local = analytics.simulateWHI(d, Number(extraFunding) || 0, Number(extraPrograms) || 0);
    const baseAdj = analytics.calcAdjustedWHI(d, reps);
    const newScore = Math.min(100, baseAdj.adjustedWHI + local.delta);
    return res.json({
      district: d.name,
      base: baseAdj.adjustedWHI,
      newScore,
      delta: newScore - baseAdj.adjustedWHI,
      awarenessGain: local.awarenessGain,
      hygieneGain: local.hygieneGain,
      anaemiaGain: local.anaemiaGain,
      menopauseGain: local.menopauseGain,
      model: local.model,
      source: 'node-fallback',
    });
  });

  app.get('/api/fund-analytics', authMiddleware, govOnly, (req, res) => {
    const analyticsRows = state.getDistricts().map((d) => ({
      id: d.id,
      name: d.name,
      funding: d.funding,
      allocated: d.allocated,
      utilized: d.utilized,
      gap: d.allocated - d.utilized,
      utilizationRate: d.allocated ? Math.round((d.utilized / d.allocated) * 100) : 0,
      leakageDetected: analytics.detectLeakage(d),
      leakageAmount: analytics.detectLeakage(d) ? d.allocated - d.utilized : 0,
    }));
    return res.json({
      summary: {
        totalFunds: analyticsRows.reduce((a, d) => a + d.funding, 0),
        totalAllocated: analyticsRows.reduce((a, d) => a + d.allocated, 0),
        totalUtilized: analyticsRows.reduce((a, d) => a + d.utilized, 0),
        leakageFlagged: analyticsRows.filter((d) => d.leakageDetected).length,
      },
      districts: analyticsRows,
    });
  });

  app.post('/api/analytics/recommendations', authMiddleware, govOnly, async (req, res) => {
    const d = state.getDistricts().find((x) => x.id === Number(req.body?.districtId));
    if (!d) return res.status(404).json({ error: 'District not found' });
    const payload = districtToMlPayload(d);
    const mlRec = await mlClient.postRecommendations(payload);
    if (mlRec) return res.json({ source: 'ml-service', ...mlRec });
    return res.json({
      source: 'node-placeholder',
      district: d.name,
      recommendations: [],
      note: 'Set ML_SERVICE_URL to enable full recommendation engine.',
    });
  });

  app.post('/api/menopause/assess', async (req, res) => {
    const body = req.body || {};
    const mlMenopause = await mlClient.postMenopauseAssess({
      hot_flashes: !!body.hotFlashes,
      mood_swings: !!body.moodSwings,
      sleep_issues: !!body.sleepIssues,
      fatigue: !!body.fatigue,
      joint_pain: !!body.jointPain,
      irregular_periods: !!body.irregularPeriods,
      weight_changes: !!body.weightChanges,
    });
    if (mlMenopause) return res.json(mlMenopause);
    const count = [
      body.hotFlashes,
      body.moodSwings,
      body.sleepIssues,
      body.fatigue,
      body.jointPain,
    ].filter(Boolean).length;
    let likelihood;
    let message;
    if (count >= 4) {
      likelihood = 'High';
      message = 'Strong pattern — consult a gynecologist.';
    } else if (count >= 2) {
      likelihood = 'Moderate';
      message = 'Monitor symptoms and seek care if they persist.';
    } else {
      likelihood = 'Low';
      message = 'Low burden — keep routine check-ups.';
    }
    return res.json({
      likelihood,
      symptom_count: count,
      message,
      recommend_specialist: count >= 3,
      source: 'node-fallback',
    });
  });

  app.get('/api/health', (req, res) =>
    res.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() })
  );
}

module.exports = { registerRoutes };
