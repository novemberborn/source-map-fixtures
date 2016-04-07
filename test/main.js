import { basename, join } from 'path'

import test from 'ava'
import glob from 'glob'
import proxyquire from 'proxyquire'
import { stub } from 'sinon'

const fixturesDir = join(__dirname, '..', 'fixtures')
const srcDir = join(__dirname, '..', 'src')

const readFileSync = stub()
test.serial.beforeEach(() => {
  readFileSync.reset()
})

const main = proxyquire('../', {
  fs: { readFileSync }
})

glob.sync('*.js', { cwd: srcDir, strict: true }).map(file => basename(file, '.js')).forEach(name => {
  ;[
    { member: 'inline', type: 'inline' },
    { member: 'mapFile', type: 'map-file' },
    { member: 'none', type: 'none' }
  ].forEach(({ member, type }) => {
    const wrapper = () => main[member](name)

    test(`${name}-${type}: wrapper has the correct name`, t => {
      t.is(wrapper().name, name)
    })

    test(`${name}-${type}: wrapper has the correct type`, t => {
      t.is(wrapper().type, type)
    })

    test(`${name}-${type}: wrapper points at the correct file`, t => {
      t.is(wrapper().file, join(fixturesDir, `${name}-${type}.js`))
    })

    test(`${name}-${type}: wrapper points at the correct source file`, t => {
      t.is(wrapper().sourceFile, join(srcDir, `${name}.js`))
    })

    test(`${name}-${type}: fixture can be required`, t => {
      t.is(wrapper().require(), require(join(fixturesDir, `${name}-${type}.js`)))
    })

    ;[
      { label: 'content', method: 'contentSync', sourceProp: 'file' },
      { label: 'source content', method: 'sourceContentSync', sourceProp: 'sourceFile' }
    ].forEach(({ label, method, sourceProp }) => {
      test.serial(`${name}-${type}: ${label} can be loaded`, t => {
        t.truthy(readFileSync.notCalled)
        const expected = Symbol()
        readFileSync.returns(expected)

        const w = wrapper()
        const actual = w[method]()

        t.truthy(readFileSync.calledOnce)
        const { args: [file, encoding] } = readFileSync.firstCall
        t.is(file, w[sourceProp])
        t.is(encoding, 'utf8')
        t.is(actual, expected)
      })

      test.serial(`${name}-${type}: ${label} is cached`, t => {
        t.truthy(readFileSync.notCalled)
        readFileSync.returns(Symbol())

        const w = wrapper()
        const expected = w[method]()
        const cached = w[method]()

        t.truthy(readFileSync.calledOnce)
        t.is(cached, expected)
      })
    })
  })
})
