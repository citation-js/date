/* eslint-env mocha */

import expect from 'expect.js'
import {parse} from '../src/'

describe('parser', function () {
  describe('epoch time', function () {
    it('works', function () {
      expect(parse(0)).to.eql({'date-parts': [[1970, 1, 1]]})
      expect(parse(1500000000000)).to.eql({'date-parts': [[2017, 7, 14]]})
    })
    it('ignores non-numerical values', function () {
      expect(parse('1500000000000')).not.to.eql({'date-parts': [[2017, 7, 14]]})
    })
  })
  describe('ISO-8601 time', function () {
    it('works for short dates', function () {
      expect(parse('0000-01-01')).to.eql({'date-parts': [[0, 1, 1]]})
      expect(parse('2000-01-01')).to.eql({'date-parts': [[2000, 1, 1]]})
      expect(parse('9999-01-01')).to.eql({'date-parts': [[9999, 1, 1]]})
    })
    it('works for long dates', function () {
      expect(parse('000000-01-01')).to.eql({'date-parts': [[0, 1, 1]]})
      expect(parse('002000-01-01')).to.eql({'date-parts': [[2000, 1, 1]]})
      expect(parse('200000-01-01')).to.eql({'date-parts': [[200000, 1, 1]]})
      expect(parse('+002000-01-01')).to.eql({'date-parts': [[2000, 1, 1]]})
      expect(parse('-002000-01-01')).to.eql({'date-parts': [[-2000, 1, 1]]})
    })
    it('works for super long dates', function () {
      expect(parse(`${13e7}-01-01`)).to.eql({'date-parts': [[13e7, 1, 1]]})
    })
    it('disregards time values', function () {
      expect(parse('2000-01-01T20:20:20')).to.eql({'date-parts': [[2000, 1, 1]]})
    })
    it('works for different precisions', function () {
      expect(parse('2000-01-01')).to.eql({'date-parts': [[2000, 1, 1]]})
      expect(parse('2000-01-00')).to.eql({'date-parts': [[2000, 1]]})
      expect(parse('2000-00-00')).to.eql({'date-parts': [[2000]]})
    })
  })
  describe('RFC-2822 time', function () {
    it('works', function () {
      expect(parse('1 Jan 0000')).to.eql({'date-parts': [[0, 1, 1]]})
      expect(parse('5 Feb 2000')).to.eql({'date-parts': [[2000, 2, 5]]})
      expect(parse('12 Mar 20001')).to.eql({'date-parts': [[20001, 3, 12]]})
    })
    it('works with week days', function () {
      expect(parse('Tue, 23 May 0000')).to.eql({'date-parts': [[0, 5, 23]]})
      expect(parse('Fri, 13 Apr 2001')).to.eql({'date-parts': [[2001, 4, 13]]})
      expect(parse('Wed, 30 Jun 20001')).to.eql({'date-parts': [[20001, 6, 30]]})
    })
    it('disregards time values', function () {
      expect(parse('Sat, 1 Jan 2000 20h20m20s')).to.eql({'date-parts': [[2000, 1, 1]]})
    })
  })
  describe('non-standard time', function () {
    describe('with day-precision', function () {
      it('works', function () {
        expect(parse('1 1 2000')).to.eql({'date-parts': [[2000, 1, 1]]})
        expect(parse('1 Jan 2000')).to.eql({'date-parts': [[2000, 1, 1]]})
        expect(parse('01 01 2000')).to.eql({'date-parts': [[2000, 1, 1]]})
        expect(parse('01 Jan 2000')).to.eql({'date-parts': [[2000, 1, 1]]})
        expect(parse('1 1 -2000')).to.eql({'date-parts': [[-2000, 1, 1]]})
        expect(parse('1 Jan -2000')).to.eql({'date-parts': [[-2000, 1, 1]]})
      })
      it('works reversed', function () {
        expect(parse('2000 1 1')).to.eql({'date-parts': [[2000, 1, 1]]})
        expect(parse('2000 Jan 1')).to.eql({'date-parts': [[2000, 1, 1]]})
        expect(parse('2000 01 01')).to.eql({'date-parts': [[2000, 1, 1]]})
        expect(parse('2000 Jan 01')).to.eql({'date-parts': [[2000, 1, 1]]})
        expect(parse('-2000 1 1')).to.eql({'date-parts': [[-2000, 1, 1]]})
        expect(parse('-2000 Jan 1')).to.eql({'date-parts': [[-2000, 1, 1]]})
      })
      it('disregards time values', function () {
        expect(parse('2000.01.01 20:20:20')).to.eql({'date-parts': [[2000, 1, 1]]})
      })
      context('and different separators like', function () {
        it('"." work', function () {
          expect(parse('1.1.2000')).to.eql({'date-parts': [[2000, 1, 1]]})
        })
        it('"-" work', function () {
          expect(parse('1-1-2000')).to.eql({'date-parts': [[2000, 1, 1]]})
        })
        it('"/" work', function () {
          expect(parse('1/1/2000')).to.eql({'date-parts': [[2000, 1, 1]]})
        })
      })
      context('and American formatting', function () {
        it('works', function () {
          expect(parse('5/2/2000')).to.eql({'date-parts': [[2000, 5, 2]]})
          expect(parse('5/2/20')).to.eql({'date-parts': [[20, 5, 2]]})
        })
        it('ignores invalid dates', function () {
          expect(parse('30/5/2000')).to.eql({'date-parts': [[2000, 5, 30]]})
        })
        it('ignores dates with other separators', function () {
          expect(parse('5 2 2000')).not.to.eql({'date-parts': [[2000, 5, 2]]})
        })
        it('disregards time values', function () {
          expect(parse('1/1/2000 20:20:20')).to.eql({'date-parts': [[2000, 1, 1]]})
        })
      })
    })
    describe('with month-precision', function () {
      it('works', function () {
        expect(parse('Jan 2000')).to.eql({'date-parts': [[2000, 1]]})
        expect(parse('2000 Jan')).to.eql({'date-parts': [[2000, 1]]})
        expect(parse('January 2000')).to.eql({'date-parts': [[2000, 1]]})
        expect(parse('Jan -2000')).to.eql({'date-parts': [[-2000, 1]]})
        expect(parse('-2000 Jan')).to.eql({'date-parts': [[-2000, 1]]})
      })
      it('works when both values are numbers', function () {
        expect(parse('1 2000')).to.eql({'date-parts': [[2000, 1]]})
        expect(parse('2000 1')).to.eql({'date-parts': [[2000, 1]]})
      })
      it('works when one value is negative', function () {
        expect(parse('1 -2000')).to.eql({'date-parts': [[-2000, 1]]})
        expect(parse('-2000 1')).to.eql({'date-parts': [[-2000, 1]]})
      })
      it('defaults to MM YY', function () {
        expect(parse('1 2')).to.eql({'date-parts': [[2, 1]]})
        expect(parse('1 -2')).to.eql({'date-parts': [[-2, 1]]})
      })
    })
    describe('with year-precision', function () {
      it('works', function () {
        expect(parse('2000')).to.eql({'date-parts': [[2000]]})
        expect(parse('-2000')).to.eql({'date-parts': [[-2000]]})
      })
    })
  })
  describe('invalid time', function () {
    it('works for non-strings and non-numbers', function () {
      expect(parse()).to.eql({raw: undefined})
    })
    it('works for invalid month names', function () {
      let inputs = ['2000 naj 1', '1 naj 2000', 'naj 2000', '2000 naj']
      for (let input of inputs) {
        expect(parse(input)).to.have.property('raw', input)
      }
    })
    it('works for invalid strings', function () {
      expect(parse('foo')).to.have.property('raw', 'foo')
    })
    it('works for invalid numbers', function () {
      expect(parse(NaN)).to.have.property('raw')
      expect(parse(Infinity)).to.eql({raw: Infinity})
    })
  })
})
