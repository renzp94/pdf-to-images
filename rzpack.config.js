/* eslint-disable @typescript-eslint/no-var-requires */
const { defineConfig } = require('rzpack')

module.exports = defineConfig({
  html: {
    title: 'PDF在线转换图片',
  },
  assets: {
    jsxTools: 'esbuild',
    cssScoped: true,
  },
})
