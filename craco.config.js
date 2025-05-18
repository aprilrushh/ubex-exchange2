// craco.config.js
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (config) => {
      if (config.resolve?.fallback) delete config.resolve.fallback;
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
        })
      );
      return config;
    },
  },
  devServer: {
    port: 3002,
    proxy: {
      // REST API 호출은 /api/... → http://localhost:3035/api/...
      '/api': {
        target: 'http://localhost:3035',
        changeOrigin: true,
        secure: false,
      },
      // socket.io WebSocket 호출도 프록시할 경우
      '/socket.io': {
        target: 'ws://localhost:3035',
        ws: true,
        changeOrigin: true,
      }
    }
  }
};
