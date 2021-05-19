/**
 * @namespace date
 * @memberof Cite.parse
 */

/**
 * Array of date parts, year-month-day. Month and day are optional.
 *
 * @typedef Cite.parse.date~dateParts
 * @type Array<Number>
 */

/**
 * Maps of month indexes by month name
 * @default
 *
 * @access private
 * @memberof Cite.parse.date
 */
const monthMap = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12
}

/**
 * Date range delimiters:
 *
 *  - with spaces: " to ", " / ", " - "
 *  - without spaces: "YYYY-MM-DD/YYYY-MM-DD" (limited to avoid conflicts w/ YYYY/YYYY and YYYY/MM)
 *  - optional spaces: "--", "–", "—" (no conflict as they are not date part separators)
 *
 * @access private
 * @memberof Cite.parse.date
 */
const dateRangeDelimiters = / (?:to|[-/]) | ?(?:--|[–—]) ?|(?<=\d{4}-\d{2}-\d{2})\/(?=\d{4}-\d{2}-\d{2})/

/**
 * Get month index from month name
 *
 * @access private
 * @memberof Cite.parse.date
 *
 * @param {String} monthName - Name of the given month (in English), or abbreviations
 * @return {Number|undefined} month index
 */
function getMonth (monthName) {
  return monthMap[monthName.toLowerCase().slice(0, 3)]
}

/**
 * Get date parts from epoch time
 *
 * @access private
 * @memberof Cite.parse.date
 *
 * @param {Number} date - epoch time
 * @return {Cite.parse.date~dateParts} if valid epoch time
 * @return {null} else null
 */
function parseEpoch (date) {
  const epoch = new Date(date)

  if (typeof date === 'number' && !isNaN(epoch.valueOf())) {
    return [epoch.getFullYear(), epoch.getMonth() + 1, epoch.getDate()]
  } else {
    return null
  }
}

/**
 * Get date parts from ISO-8601 time. Formats supported:
 *
 *   * YYYY-MM-DD
 *   * YYYY-MM
 *   * [+-]YYYYYY[Y...]-MM-DD
 *   * [+-]YYYYYY[Y...]-MM
 *
 * Time parts are supported but disregarded.
 *
 * @access private
 * @memberof Cite.parse.date
 *
 * @param {String} date - ISO-8601 time
 * @return {Cite.parse.date~dateParts} if valid ISO-8601 time
 * @return {null} else null
 */
const parseIso8601 = function (date) {
  const pattern = /^(\d{4}|[-+]\d{6,})-(\d{2})(?:-(\d{2}))?/

  if (typeof date !== 'string' || !pattern.test(date)) {
    return null
  }

  const [, year, month, day] = date.match(pattern)

  if (!+month) {
    return [year]
  } else if (!+day) {
    return [year, month]
  } else {
    return [year, month, day]
  }
}

/**
 * Get date parts from RFC-2822 time. Formats supported:
 *
 *   * [DDD, ]DD MMM YYYY
 *
 * Where DDD denotes week day name and MMM denotes month name.
 *
 * Time parts are supported but disregarded.
 *
 * @access private
 * @memberof Cite.parse.date
 *
 * @param {String} date - RFC-2822 time
 * @return {Cite.parse.date~dateParts} if valid RFC-2822 time
 * @return {null} else null
 */
const parseRfc2822 = function (date) {
  const pattern = /^(?:[a-z]{3},\s*)?(\d{1,2}) ([a-z]{3}) (\d{4,})/i

  if (typeof date !== 'string' || !pattern.test(date)) {
    return null
  }

  let [, day, month, year] = date.match(pattern)

  month = getMonth(month)
  if (!month) {
    return null
  }

  return [year, month, day]
}

/**
 * Get date-parts from a classical American date with day-precision. Formats supported:
 *
 *   * M[M]/D[D]/YY[YY]
 *
 * Note that the last case mandates a two- or four-digit year.
 *
 * The date is considered invalid if it doesn't exist according to the
 * native `Date` implementation.
 *
 * @access private
 * @memberof Cite.parse.date
 *
 * @param {String} date - day time
 * @return {Cite.parse.date~dateParts} if valid day time
 * @return {null} else null
 */
function parseAmericanDay (date) {
  const pattern = /^(\d{1,2})\/(\d{1,2})\/(\d{2}(?:\d{2})?)/

  if (typeof date !== 'string' || !pattern.test(date)) {
    return null
  }

  const [, month, day, year] = date.match(pattern)

  const check = new Date(year, month, day)
  if (check.getMonth() === parseInt(month)) {
    return [year, month, day]
  } else {
    return null
  }
}

/**
 * Get date-parts from a non-standard date with day-precision. Formats supported:
 *
 *   * D[D] M[M] [-]Y[Y...]
 *   * D[D] MMM [-]Y[Y...]
 *   * [-]Y[Y...] M[M] D[D]
 *   * [-]Y[Y...] MMM D[D]
 *
 * Where MMM denotes month name.
 *
 * In all cases, " ", ".", "-" and "/" are all considered valid separators.
 *
 * This format prefers YY MM DD over DD MM YY and YY MMM DD over DD MMM YY
 * if distinction is necessary. Note that in the overlap between these dates
 * and the American date format ({@link Cite.parse.date.parseAmericanDay}), the latter is
 * preferred, only when the separator is "/" and the date would be valid.
 *
 * Any trailing parts (e.g. time parts) are supported but disregarded.
 *
 * @access private
 * @memberof Cite.parse.date
 *
 * @param {String} date - day time
 * @return {Cite.parse.date~dateParts} if valid day time
 * @return {null} else null
 */
function parseDay (date) {
  const pattern = /^(\d{1,2})[ .\-/](\d{1,2}|[a-z]{3,10})[ .\-/](-?\d+)/i
  const reversePattern = /^(-?\d+)[ .\-/](\d{1,2}|[a-z]{3,10})[ .\-/](\d{1,2})/i

  let year
  let month
  let day

  if (typeof date !== 'string') {
    return null
  } else if (pattern.test(date)) {
    [, day, month, year] = date.match(pattern)
  } else if (reversePattern.test(date)) {
    [, year, month, day] = date.match(reversePattern)
  } else {
    return null
  }

  if (getMonth(month)) {
    month = getMonth(month)
  } else if (isNaN(month)) {
    return null
  }

  return [year, month, day]
}

/**
 * Get date-parts from a non-standard date with month-precision. Formats supported:
 *
 *   * M[M] [-]Y[Y...]
 *   * MMM [-]Y[Y...]
 *   * [-]Y[Y...] M[M] (1)
 *   * [-]Y[Y...] MMM
 *
 * Where MMM denotes month name.
 *
 * 1) since this format is ambigious with the first format, this is only
 * assumed when the year is bigger than the month.
 *
 * In all cases, any sequence of non-alphanumerical characters is considered a valid
 * separator.
 *
 * Trailing parts are **not** supported.
 *
 * @access private
 * @memberof Cite.parse.date
 *
 * @param {String} date - month time
 * @return {Cite.parse.date~dateParts} if valid month time
 * @return {null} else null
 */
function parseMonth (date) {
  const pattern = /^([a-z]{3,10}|-?\d+)[^\w-]+([a-z]{3,10}|-?\d+)$/i
  if (typeof date === 'string' && pattern.test(date)) {
    const values = date.match(pattern).slice(1, 3)

    let month
    if (getMonth(values[1])) {
      month = getMonth(values.pop())
    } else if (getMonth(values[0])) {
      month = getMonth(values.shift())
    } else if (values.some(isNaN) || values.every(value => +value < 0)) {
      return null
    } else if (+values[0] < 0) {
      month = values.pop()
    } else if (+values[0] > +values[1] && +values[1] > 0) {
      month = values.pop()
    } else {
      month = values.shift()
    }

    const year = values.pop()

    return [year, month]
  } else {
    return null
  }
}

/**
 * Get date-parts from a non-standard date with year-precision. Formats supported:
 *
 *   * [-]Y[Y...]
 *
 * Trailing parts are **not** supported.
 *
 * @access private
 * @memberof Cite.parse.date
 *
 * @param {String} date - year time
 * @return {Cite.parse.date~dateParts} if valid year time
 * @return {null} else null
 */
function parseYear (date) {
  if (typeof date !== 'string') {
    return null
  }

  const adBc = date.match(/^(\d+) ?(a\.?d\.?|b\.?c\.?)$/i)

  if (adBc) {
    const [date, suffix] = adBc.slice(1)
    return [date * (suffix.toLowerCase()[0] === 'a' ? 1 : -1)]
  } else if (/^-?\d+$/.test(date)) {
    return [date]
  } else {
    return null
  }
}

/**
 * Extract date parts (year, month, day) from text. Supported formats:
 *
 *   * Epoch time (in number form)
 *   * `YYYY-MM-DD`
 *   * `[+-]YYYYYY[Y...]-MM-DD`
 *   * `[DDD, ]DD MMM YYYY`
 *   * `M[M]/D[D]/YY[YY]       (1)`
 *   * `D[D] M[M] Y[Y...]      (2, 1)`
 *   * `[-]Y[Y...] M[M] D[D]   (2)`
 *   * `D[D] MMM Y[Y...]       (2)`
 *   * `[-]Y[Y...] MMM D[D]    (2)`
 *   * `M[M] [-]Y[Y...]        (3, 5)`
 *   * `[-]Y[Y...] M[M]        (3, 4, 5)`
 *   * `MMM [-]Y[Y...]         (3, 5)`
 *   * `[-]Y[Y...] MMM         (3, 5)`
 *   * `[-]Y[Y...]             (5)`
 *
 * Generally, formats support trailing parts, which are disregarded.
 *
 *   1. When the former of these formats overlaps with the latter, the
 *      former is preferred
 *   2. " ", ".", "-" and "/" are all supported as separator
 *   3. Any sequence of non-alphanumerical characters are supported as
 *      separator
 *   4. This format is only assumed if the year is bigger than the month
 *   5. This format doesn't support trailing parts
 *
 * @access private
 * @memberof Cite.parse.date
 *
 * @param {Number|String} value - date in supported format, see above
 *
 * @return {Cite.parse.date~dateParts}
 */
function parseDateParts (value) {
  const dateParts = parseEpoch(value) ||
                  parseIso8601(value) ||
                  parseRfc2822(value) ||
                  parseAmericanDay(value) ||
                  parseDay(value) ||
                  parseMonth(value) ||
                  parseYear(value)

  return dateParts && dateParts.map(string => parseInt(string))
}

/**
 * Convert date to CSL date.
 *
 * @access protected
 * @memberof Cite.parse
 *
 * @param {Number|String} rangeStart - point in time, start of date range or date range delimited by hyphens/'to'/forward slash
 * @param {Number|String} [rangeEnd]
 *
 * @return {Object} Object with property "date-parts" with the value [[ YYYY, MM, DD ]]
 * @return {Object} If unparsable, object with property "raw" with the inputted value
 */
function parseDate (rangeStart, rangeEnd) {
  const range = []
  const rangeStartAsRange = typeof rangeStart === 'string' && rangeStart.split(dateRangeDelimiters)

  if (rangeEnd) {
    range.push(rangeStart, rangeEnd)
  } else if (rangeStartAsRange && rangeStartAsRange.length === 2) {
    range.push(...rangeStartAsRange)
  } else {
    range.push(rangeStart)
  }

  const dateParts = range.map(parseDateParts)

  if (dateParts.filter(Boolean).length === range.length) {
    return { 'date-parts': dateParts }
  } else {
    return { raw: rangeEnd ? range.join('/') : rangeStart }
  }
}

export default parseDate
