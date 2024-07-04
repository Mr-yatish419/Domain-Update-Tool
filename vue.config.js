const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    port: 8080, // or the port your application is using
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    https: true,
    client: {
      webSocketURL: 'wss://c4c9-115-113-30-230.ngrok-free.app/ws',
    },
  }
});



