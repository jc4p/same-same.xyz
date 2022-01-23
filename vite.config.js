import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      process: 'process/browser',
      util: 'util'
    }
  }
})
