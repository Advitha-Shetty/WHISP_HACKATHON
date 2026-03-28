require('dotenv').config();
const { bootstrap } = require('./src/initData');
const { createApp } = require('./src/app');

const PORT = Number(process.env.PORT) || 5000;

bootstrap()
  .then(({ reportsStore }) => {
    const app = createApp(reportsStore);
    app.listen(PORT, () => {
      console.log(`WHISP API → http://localhost:${PORT}`);
      console.log(`Health    → http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to start WHISP API:', err);
    process.exit(1);
  });
