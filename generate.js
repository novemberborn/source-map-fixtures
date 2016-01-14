'use strict'

const fs = require('fs')
const path = require('path')

const babel = require('babel-core')
const glob = require('glob')
const rimraf = require('rimraf')
const rollup = require('rollup')

module.exports = function generate (srcDir, destDir) {
  rimraf.sync(destDir)
  fs.mkdirSync(destDir)

  function prepareBundle () {
    return rollup.rollup({ entry: path.join(srcDir, 'bundle.js') }).then(bundle => {
      const generated = bundle.generate({ sourceMap: true })
      generated.map.sources = generated.map.sources.map(source => path.basename(source))
      generated.map.sourceRoot = '../src'
      return generated
    })
  }

  function transform (filename, bundle) {
    const opts = {
      ast: false,
      filename,
      plugins: [
        'transform-es2015-arrow-functions',
        'transform-es2015-block-scoping',
        'transform-es2015-modules-commonjs',
        'transform-strict-mode'
      ],
      sourceMaps: true,
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
    fs.writeFileSync(path.join(destDir, name + '-' + type + '.js'), code + '\n')
  }

  function writeMap (name, type, map) {
    fs.writeFileSync(path.join(destDir, name + '-' + type + '.js.map'), JSON.stringify(map, null, 2) + '\n')
  }

  return prepareBundle().then(bundle => {
    glob.sync('*.js', { cwd: srcDir }).forEach(filename => {
      const name = path.basename(filename, '.js')

      const transformed = transform(filename, bundle)
      const encodedMap = new Buffer(JSON.stringify(transformed.map)).toString('base64')

      writeJs(name, 'inline', transformed.code + '\n//# sourceMappingURL=data:application/json;base64,' + encodedMap)
      writeJs(name, 'map-file', transformed.code + '\n//# sourceMappingURL=' + name + '-map-file.js.map')
      writeMap(name, 'map-file', transformed.map)
      writeJs(name, 'none', transformed.code)
    })
  })
}
