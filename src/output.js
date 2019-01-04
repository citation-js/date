function padStart (str, len, chr) {
  while (str.length < len) {
    str = chr + str
  }
  return str.slice(-len)
}

/**
 * Convert a CSL date into human-readable format
 *
 * @access protected
 * @memberof Cite.get
 *
 * @param {Object} date - A date in CSL format
 * @param {String} [delimiter='-'] - Date part delimiter
 *
 * @return {String} The string
 */
const getDate = function (date, delimiter = '-') {
  if (!date['date-parts']) {
    return date.raw
  }

  let dateParts = date['date-parts'][0].map(part => part.toString())

  switch (dateParts.length) {
    case 3: // Day
      dateParts[2] = padStart(dateParts[2], 2, '0')
      // fall through
    case 2: // Month
      dateParts[1] = padStart(dateParts[1], 2, '0')
      // fall through
    case 1: // Year
      dateParts[0] = padStart(dateParts[0], 4, '0')
      break
  }

  return dateParts.join(delimiter)
}

export default getDate
