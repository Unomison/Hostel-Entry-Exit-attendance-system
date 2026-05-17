// Pings the server every 14 minutes to prevent Render cold starts
// Only runs in production

const keepAlive = (serverUrl) => {
  if (process.env.NODE_ENV !== 'production') return;

  const interval = 14 * 60 * 1000; // 14 minutes

  setInterval(async () => {
    try {
      const https = require('https');
      https.get(`${serverUrl}/api/test/health`, (res) => {
        console.log(`Keep-alive ping: ${res.statusCode}`);
      }).on('error', (err) => {
        console.log('Keep-alive ping failed:', err.message);
      });
    } catch (err) {
      console.log('Keep-alive error:', err.message);
    }
  }, interval);

  console.log('✅ Keep-alive started for', serverUrl);
};

module.exports = keepAlive;