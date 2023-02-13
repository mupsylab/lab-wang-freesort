const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  devServer: {
    port: 8080
  },
  chainWebpack: config => {
    config
      .plugin("html")
      .tap(args => {
        args[0].title = "行人过街决策的研究";
        return args;
      })
  }
})
