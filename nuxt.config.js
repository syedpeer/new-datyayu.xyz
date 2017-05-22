const Webpack = require('webpack')
const fs = require('fs')
const path = require('path')

const SUPPORTED_HIGHLIGHT_LANGUAGES = require('./config/highlight-languages.js')

const API_DIR = path.resolve(__dirname, 'static', 'api')
const POSTS_DIR = path.resolve(API_DIR, 'posts')
const POSTS_PAGES_DIR = path.resolve(POSTS_DIR, 'pages')
const TAGS_DIR = path.resolve(API_DIR, 'tags')
const TAGS_PAGES_DIR = path.resolve(TAGS_DIR, 'pages')

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s | Arturo Coronel',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { property: 'og:image', content: 'https://s3-us-west-1.amazonaws.com/datyayu-xyz/bg.jpg' },
      { property: 'og:site_name', content: 'datyayu.xyz' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image:alt', content: 'datyayu.xyz logo' },
      { name: 'twitter:site', content: '@datyayu' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=3' },
      { rel: 'manifest', href: '/manifest.json' }
    ]
  },
  /*
  ** Global CSS
  */
  css: ['~assets/css/main.css'],
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#20c0b1' },
  /*
  ** Vue Plugins
  */
  plugins: [
    '~plugins/google-analytics',
    '~plugins/service-worker',
    { src: '~plugins/i18n.js', injectAs: 'i18n' }
  ],
  /*
  ** Vue Router
  */
  router: {
    scrollBehavior (to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      }

      const $header = document.querySelector('.header')
      if ($header) {
        $header.scrollIntoView()
      }

      return { x: 0, y: 0 }
    }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Vendor files
    */
    vendor: [
      'axios',
      'left-pad',
      'promise-polyfill',
      'vue-i18n'
    ],
    /*
    ** Run ESLINT on save
    */
    extend (config, { isClient }) {
      if (isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },

    plugins: [
      new Webpack.ContextReplacementPlugin(
        /highlight\.js\/lib\/languages$/,
        new RegExp(`^./(${SUPPORTED_HIGHLIGHT_LANGUAGES.join('|')})$`)
      )
    ],

    loaders: [
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader',
        query: {
          limit: 1000, // 1KO
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 1000, // 1 KO
          name: 'fonts/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(webm|mp4)$/,
        loader: 'file-loader'
      }
    ]
  },
  /*
  ** Server rendering cache config
  */
  cache: {
    max: 100,
    maxAge: 900000
  },
  /*
  ** Static build config
  */
  generate: {
    routes: [
      ...fs.readdirSync(POSTS_DIR)
        .map(file => {
          const postname = file.replace('.json', '')
          return `/blog/posts/${postname}`
        }),
      ...fs.readdirSync(POSTS_PAGES_DIR)
        .map(file => {
          const postname = file.replace('.json', '')
          return `/blog/posts/page/${postname}`
        }),
      ...fs.readdirSync(TAGS_DIR)
        .map(file => {
          const tagname = file.replace('.json', '')
          return `/blog/tags/${tagname}`
        }),
      ...fs.readdirSync(TAGS_PAGES_DIR)
        .map(file => {
          const filename = file.replace('.json', '')
          const page = filename.match(/[0-9]+$/)
          const tagname = filename.replace(/-[0-9]+$/, '')

          return `/blog/tags/${tagname}/${page}`
        })
    ]
  }
}
