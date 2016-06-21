'use strict'

// Patch path.dirname() to allow pre-Node.js v6 behavior. Allows AVA to use
// babel-core@6.7.4 under Node.js v6.
const path = require('path')
const { dirname } = path
path.dirname = (path = '') => dirname(path)

// Run AVA.
require('../node_modules/.bin/ava')
