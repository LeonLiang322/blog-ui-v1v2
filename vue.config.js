const { defineConfig } = require('@vue/cli-service')

const { VuetifyPlugin } = require('webpack-plugin-vuetify')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 9093,
  },
  pluginOptions: {
    vuetify: {
			// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
		}
  },
  configureWebpack: {
    plugins: [
      new VuetifyPlugin({
        // styles: { configFile: 'src/assets/scss/settings.scss' }
      }),
    ]
  },
  productionSourceMap: false,
})

console.log('api proxy:', process.env.VUE_APP_BASE_API);

