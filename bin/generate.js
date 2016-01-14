'use strict'

const path = require('path')

const generate = require('../generate')

const fixturesDir = path.join(__dirname, '..', 'fixtures')
const srcDir = path.join(__dirname, '..', 'src')

generate(srcDir, fixturesDir).catch(err => {
  console.error(err && err.stack || err)
  process.exit(1)
})
