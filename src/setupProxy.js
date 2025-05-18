const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3035',  // 백엔드 서버 포트를 3035로 수정
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'  // /api를 유지
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Proxy Error', message: err.message });
      }
    })
  );
}; 