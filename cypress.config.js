const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    pageLoadTimeout: 10000,
    defaultCommandTimeout: 10000,
    supportFile: false,
    baseUrl: 'http://localhost:8080',
  },
})
