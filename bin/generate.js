'use strict'

const fs = require('fs')
const path = require('path')

const babel = require('babel-core')
const glob = require('glob')
const rimraf = require('rimraf')
const rollup = require('rollup')

const fixturesDir = path.join(__dirname, '..', 'fixtures')
const srcDir = path.join(__dirname, '..', 'src')

rimraf.sync(fixturesDir)
fs.mkdirSync(fixturesDir)

function prepareBundle () {
  return rollup.rollup({ entry: path.join(srcDir, 'bundle.js') }).then(bundle => {
    const generated = bundle.generate({ sourceMap: true })
    generated.map.sources = generated.map.sources.map(source => path.basename(source))
    return generated
  })
}

function transform (filename, sourceMaps, bundle) {
  const opts = {
    ast: false,
    filename,
    plugins: [
      'transform-es2015-arrow-functions',
      'transform-es2015-block-scoping',
      'transform-es2015-modules-commonjs',
      'transform-strict-mode'
    ],
    sourceMaps,
    sourceRoot: '../src'
  }

  let code
  if (filename === 'bundle.js') {
    opts.inputSourceMap = bundle.map
    code = bundle.code
  } else {
    code = fs.readFileSync(path.join(srcDir, filename), 'utf8')
  }

  return babel.transform(code, opts)
}

function writeJs (name, type, code) {
  fs.writeFileSync(path.join(fixturesDir, name + '-' + type + '.js'), code + '\n')
}

function writeMap (name, type, map) {
  fs.writeFileSync(path.join(fixturesDir, name + '-' + type + '.js.map'), JSON.stringify(map, null, 2) + '\n')
}

prepareBundle().then(bundle => {
  glob.sync('*.js', { cwd: srcDir }).forEach(filename => {
    const name = path.basename(filename, '.js')

    const inline = transform(filename, 'inline', bundle)
    const mapFile = transform(filename, true, bundle)

    writeJs(name, 'inline', inline.code)
    writeJs(name, 'map-file', mapFile.code + '\n//# sourceMappingURL=' + name + '-map-file.js.map')
    writeMap(name, 'map-file', mapFile.map)
    writeJs(name, 'none', mapFile.code)
  })
}).catch(err => {
  console.error(err && err.stack || err)
  process.exit(1)
})
