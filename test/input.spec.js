/* eslint-env mocha */

import assert from 'assert'
import { parse } from '../src/'

function compare (input, output, shouldEqual = true) {
  assert[shouldEqual ? 'deepStrictEqual' : 'notDeepStrictEqual'](
    Array.isArray(input) ? parse(...input) : parse(input),
    output,
    `Incorrect output for "${input}"`
  )
}

describe('parser', function () {
  describe('epoch time', function () {
    it('works', function () {
      compare(0, { 'date-parts': [[1970, 1, 1]] })
      compare(1500000000000, { 'date-parts': [[2017, 7, 14]] })
    })
    it('ignores non-numerical values', function () {
      compare('1500000000000', { 'date-parts': [[2017, 7, 14]] }, false)
    })
  })
  describe('ISO-8601 time', function () {
    it('works for short dates', function () {
      compare('0000-01-01', { 'date-parts': [[0, 1, 1]] })
      compare('2000-01-01', { 'date-parts': [[2000, 1, 1]] })
      compare('9999-01-01', { 'date-parts': [[9999, 1, 1]] })
    })
    it('works for dates without day', function () {
      compare('2000-01', { 'date-parts': [[2000, 1]] })
    })
    it('works for long dates', function () {
      compare('000000-01-01', { 'date-parts': [[0, 1, 1]] })
      compare('002000-01-01', { 'date-parts': [[2000, 1, 1]] })
      compare('200000-01-01', { 'date-parts': [[200000, 1, 1]] })
      compare('+002000-01-01', { 'date-parts': [[2000, 1, 1]] })
      compare('-002000-01-01', { 'date-parts': [[-2000, 1, 1]] })
    })
    it('works for super long dates', function () {
      compare(`${13e7}-01-01`, { 'date-parts': [[13e7, 1, 1]] })
    })
    it('disregards time values', function () {
      compare('2000-01-01T20:20:20', { 'date-parts': [[2000, 1, 1]] })
    })
    it('works for different precisions', function () {
      compare('2000-01-01', { 'date-parts': [[2000, 1, 1]] })
      compare('2000-01-00', { 'date-parts': [[2000, 1]] })
      compare('2000-00-00', { 'date-parts': [[2000]] })
    })
  })
  describe('RFC-2822 time', function () {
    it('works', function () {
      compare('1 Jan 0000', { 'date-parts': [[0, 1, 1]] })
      compare('5 Feb 2000', { 'date-parts': [[2000, 2, 5]] })
      compare('12 Mar 20001', { 'date-parts': [[20001, 3, 12]] })
    })
    it('works with week days', function () {
      compare('Tue, 23 May 0000', { 'date-parts': [[0, 5, 23]] })
      compare('Fri, 13 Apr 2001', { 'date-parts': [[2001, 4, 13]] })
      compare('Wed, 30 Jun 20001', { 'date-parts': [[20001, 6, 30]] })
    })
    it('disregards time values', function () {
      compare('Sat, 1 Jan 2000 20h20m20s', { 'date-parts': [[2000, 1, 1]] })
    })
  })
  describe('non-standard time', function () {
    describe('with day-precision', function () {
      it('works', function () {
        compare('1 1 2000', { 'date-parts': [[2000, 1, 1]] })
        compare('1 Jan 2000', { 'date-parts': [[2000, 1, 1]] })
        compare('01 01 2000', { 'date-parts': [[2000, 1, 1]] })
        compare('01 Jan 2000', { 'date-parts': [[2000, 1, 1]] })
        compare('1 1 -2000', { 'date-parts': [[-2000, 1, 1]] })
        compare('1 Jan -2000', { 'date-parts': [[-2000, 1, 1]] })
      })
      it('works reversed', function () {
        compare('2000 1 1', { 'date-parts': [[2000, 1, 1]] })
        compare('2000 Jan 1', { 'date-parts': [[2000, 1, 1]] })
        compare('2000 01 01', { 'date-parts': [[2000, 1, 1]] })
        compare('2000 Jan 01', { 'date-parts': [[2000, 1, 1]] })
        compare('-2000 1 1', { 'date-parts': [[-2000, 1, 1]] })
        compare('-2000 Jan 1', { 'date-parts': [[-2000, 1, 1]] })
      })
      it('disregards time values', function () {
        compare('2000.01.01 20:20:20', { 'date-parts': [[2000, 1, 1]] })
      })
      context('and different separators like', function () {
        it('"." work', function () {
          compare('1.1.2000', { 'date-parts': [[2000, 1, 1]] })
        })
        it('"-" work', function () {
          compare('1-1-2000', { 'date-parts': [[2000, 1, 1]] })
        })
        it('"/" work', function () {
          compare('1/1/2000', { 'date-parts': [[2000, 1, 1]] })
        })
      })
      context('and American formatting', function () {
        it('works', function () {
          compare('5/2/2000', { 'date-parts': [[2000, 5, 2]] })
          compare('5/2/20', { 'date-parts': [[20, 5, 2]] })
        })
        it('ignores invalid dates', function () {
          compare('30/5/2000', { 'date-parts': [[2000, 5, 30]] })
        })
        it('ignores dates with other separators', function () {
          compare('5 2 2000', { 'date-parts': [[2000, 5, 2]] }, false)
        })
        it('disregards time values', function () {
          compare('1/1/2000 20:20:20', { 'date-parts': [[2000, 1, 1]] })
        })
      })
    })
    describe('with month-precision', function () {
      it('works', function () {
        compare('Jan 2000', { 'date-parts': [[2000, 1]] })
        compare('2000 Jan', { 'date-parts': [[2000, 1]] })
        compare('January 2000', { 'date-parts': [[2000, 1]] })
        compare('Jan -2000', { 'date-parts': [[-2000, 1]] })
        compare('-2000 Jan', { 'date-parts': [[-2000, 1]] })
      })
      it('works when both values are numbers', function () {
        compare('1 2000', { 'date-parts': [[2000, 1]] })
        compare('2000 1', { 'date-parts': [[2000, 1]] })
      })
      it('works when one value is negative', function () {
        compare('1 -2000', { 'date-parts': [[-2000, 1]] })
        compare('-2000 1', { 'date-parts': [[-2000, 1]] })
      })
      it('defaults to MM YY', function () {
        compare('1 2', { 'date-parts': [[2, 1]] })
        compare('1 -2', { 'date-parts': [[-2, 1]] })
      })
    })
    describe('with year-precision', function () {
      it('works', function () {
        compare('2000', { 'date-parts': [[2000]] })
        compare('-2000', { 'date-parts': [[-2000]] })
      })
      it('works for AD/BC', function () {
        compare('2000 a.d.', { 'date-parts': [[2000]] })
        compare('2000 b.c.', { 'date-parts': [[-2000]] })
        compare('2000AD', { 'date-parts': [[2000]] })
        compare('2000BC', { 'date-parts': [[-2000]] })
      })
      it('does not work for AD/BC and negative year', function () {
        compare('-2000 BC', { raw: '-2000 BC' })
      })
    })
  })
  describe('date range', function () {
    it('works with two arguments', function () {
      compare(['2000-01-02', '4 mar 2001'], { 'date-parts': [[2000, 1, 2], [2001, 3, 4]] })
    })
    it('works with delimiter', function () {
      compare('2000-01-02–2001-03-04', { 'date-parts': [[2000, 1, 2], [2001, 3, 4]] })
      compare('2000-01-02—2001-03-04', { 'date-parts': [[2000, 1, 2], [2001, 3, 4]] })
      compare('2000-01-02--2001-03-04', { 'date-parts': [[2000, 1, 2], [2001, 3, 4]] })
    })
    it('works with spaced delimiter', function () {
      compare('2000-01-02 to 2001-03-04', { 'date-parts': [[2000, 1, 2], [2001, 3, 4]] })
      compare('2000-01-02 - 2001-03-04', { 'date-parts': [[2000, 1, 2], [2001, 3, 4]] })
      compare('2000-01-02 – 2001-03-04', { 'date-parts': [[2000, 1, 2], [2001, 3, 4]] })
      compare('2000-01-02 — 2001-03-04', { 'date-parts': [[2000, 1, 2], [2001, 3, 4]] })
      compare('2000-01-02 / 2001-03-04', { 'date-parts': [[2000, 1, 2], [2001, 3, 4]] })
      compare('2000-01-02 -- 2001-03-04', { 'date-parts': [[2000, 1, 2], [2001, 3, 4]] })
    })
    it('works with special delimiter', function () {
      compare('2000-01-02/2001-03-04', { 'date-parts': [[2000, 1, 2], [2001, 3, 4]] })
    })
  })
  describe('invalid time', function () {
    it('works for non-strings and non-numbers', function () {
      compare(undefined, { raw: undefined })
    })
    it('works for invalid month names', function () {
      let inputs = ['2000 naj 1', '1 naj 2000', 'naj 2000', '2000 naj']
      for (let input of inputs) {
        compare(input, { raw: input })
      }
    })
    it('works for invalid strings', function () {
      compare('foo', { raw: 'foo' })
    })
    it('works for invalid numbers', function () {
      if (!/^v8\./.test(process.version)) {
        compare(NaN, { raw: NaN })
      }
      compare(Infinity, { raw: Infinity })
    })
  })
})
