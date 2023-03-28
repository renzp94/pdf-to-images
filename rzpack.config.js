/* eslint-disable @typescript-eslint/no-var-requires */
const { defineConfig } = require('rzpack')

module.exports = defineConfig({
  html: {
    title: 'PDF转图片',
  },
  assets: {
    jsxTools: 'esbuild',
  },
})
