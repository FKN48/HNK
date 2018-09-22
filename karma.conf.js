const path = require('path')
process.env.CHROME_BIN = require('puppeteer').executablePath()

const webpackConfig = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          plugins: [require('@babel/plugin-proposal-object-rest-spread'), require('@babel/plugin-proposal-optional-chaining')]
        }
      },
      {
        test: /\.js$/,
        use: {
          loader: 'istanbul-instrumenter-loader',
          options: { esModules: true }
        },
        include: path.resolve('src/'),
        exclude: /node_modules|\.spec\.js$/,
        enforce: 'post'
      }
    ]
  }
}

module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadless'],
    frameworks: ['chai-dom', 'chai', 'jasmine'],
    files: [
      'tests/unit/index.js'
    ],
    preprocessors: {
      'tests/unit/index.js': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    reporters: [/* 'mocha',*/ 'nyan', 'coverage-istanbul'], // eslint-disable-line
    mochaReporter: {
      ignoreSkipped: true
    },
    coverageIstanbulReporter: {
      reports: [ 'text-summary' ],
      fixWebpackSourcePaths: true,
      esModules: true
    },
    plugins: [
      'karma-nyan-reporter',
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-mocha-reporter',
      'karma-sourcemap-loader',
      'karma-webpack',
      'karma-chai',
      'istanbul-instrumenter-loader',
      'karma-coverage-istanbul-reporter',
      'karma-chai-dom'
    ]
  })
}
