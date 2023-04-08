export function dateFormat(time: number | string): string {
  if (!time) return ''
  const t = parseDate(time)
  if (!t) return ''
  const month = timePad(t.getMonth() + 1)
  const date = timePad(t.getDate())
  return `${month}/${date}/${t.getFullYear()}`
}

function timePad(time: number) {
  return (time + '').padStart(2, '0')
}

const REGEX_PARSE = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/
const isValidDate = (dateObject: string | number | Date) => new Date(dateObject).toString() !== 'Invalid Date'
function parseDate(date: string | number | Date) {
  if (!date && date !== 0) return
  if (date instanceof Date) return new Date(date)
  if (typeof date === 'string' && !/Z$/i.test(date)) {
    const d = date.match(REGEX_PARSE)
    if (d) {
      const m = +d[2] - 1 || 0
      const ms = (d[7] || '0').substring(0, 3)
      return new Date(+d[1], m, +d[3] || 1, +d[4] || 0, +d[5] || 0, +d[6] || 0, +ms)
    }
  }

  const t = new Date(date)

  if (!isValidDate(t)) return

  return t // everything else
}
