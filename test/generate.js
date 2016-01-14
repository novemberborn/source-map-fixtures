import { readFileSync } from 'fs'
import { join } from 'path'

import test from 'ava'
import glob from 'glob'
import md5hex from 'md5-hex'

import generate from '../generate'

const fixturesDir = join(__dirname, '..', 'fixtures')
const outputDir = join(__dirname, '.output')
const srcDir = join(__dirname, '..', 'src')

const fixtures = glob.sync('*.{js,js.map}', { cwd: fixturesDir, strict: true })

test.before(() => generate(srcDir, outputDir))

test('generates the same files', t => {
  const output = glob.sync('*.{js,js.map}', { cwd: outputDir, strict: true })
  t.same(output, fixtures)
})

for (const file of fixtures) {
  test(`'${file}' is equivalent`, t => {
    const actual = md5hex(readFileSync(join(outputDir, file)))
    const expected = md5hex(readFileSync(join(fixturesDir, file)))
    t.is(actual, expected)
  })
}
