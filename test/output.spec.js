/* eslint-env mocha */

import assert from 'assert'
import { format } from '../src/'

describe('formatter', function () {
  it('with nothing', function () {
    assert.strictEqual(format({ 'date-parts': [[2000, 10, 10]] }), '2000-10-10')
  })
  it('with narrow parts', function () {
    assert.strictEqual(format({ 'date-parts': [[1, 1, 1]] }), '0001-01-01')
  })
  it('with delimiter', function () {
    assert.strictEqual(format({ 'date-parts': [[2000, 10, 10]] }, '='), '2000=10=10')
  })
  it('with raw date', function () {
    assert.strictEqual(format({ raw: 'foo' }), 'foo')
  })
  it('without day', function () {
    assert.strictEqual(format({ 'date-parts': [[2000, 10]] }), '2000-10')
  })
  it('without month and day', function () {
    assert.strictEqual(format({ 'date-parts': [[200000]] }), '200000')
  })
})
