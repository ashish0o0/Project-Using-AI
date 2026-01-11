/**
 * Parse OSM opening_hours format and check if a place is currently open
 * Supports formats like: "Mo-Fr 09:00-18:00", "24/7", "Mo-Sa 08:00-22:00; Su 10:00-20:00"
 */
export function parseOpeningHours(openingHours?: string): boolean | null {
  if (!openingHours) {
    return null // Unknown status
  }

  // Handle 24/7
  if (openingHours.toLowerCase().includes('24/7') || openingHours.toLowerCase().includes('24 hours')) {
    return true
  }

  // Handle closed
  if (openingHours.toLowerCase().includes('closed') || openingHours === 'off') {
    return false
  }

  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentTime = now.getHours() * 60 + now.getMinutes() // Time in minutes

  // Map JavaScript day to OSM day format
  const dayMap: { [key: number]: string[] } = {
    0: ['Su', 'Sunday'],
    1: ['Mo', 'Monday'],
    2: ['Tu', 'Tuesday'],
    3: ['We', 'Wednesday'],
    4: ['Th', 'Thursday'],
    5: ['Fr', 'Friday'],
    6: ['Sa', 'Saturday'],
  }

  const currentDayNames = dayMap[currentDay]

  // Split by semicolon for multiple rules
  const rules = openingHours.split(';').map((r) => r.trim())

  for (const rule of rules) {
    // Check if this rule applies to today
    const dayMatch = rule.match(/^([A-Za-z]+(?:-[A-Za-z]+)?)\s+(.+)$/)
    if (!dayMatch) {
      // Try to match time-only format (assumes all days)
      const timeMatch = rule.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/)
      if (timeMatch) {
        const [, startHour, startMin, endHour, endMin] = timeMatch
        const start = parseInt(startHour) * 60 + parseInt(startMin)
        const end = parseInt(endHour) * 60 + parseInt(endMin)
        if (isTimeInRange(currentTime, start, end)) {
          return true
        }
      }
      continue
    }

    const [, dayRange, timeRange] = dayMatch
    const days = parseDayRange(dayRange)
    const appliesToday = days.some((day) => currentDayNames.includes(day))

    if (!appliesToday) {
      continue
    }

    // Parse time range
    const timeMatch = timeRange.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/)
    if (timeMatch) {
      const [, startHour, startMin, endHour, endMin] = timeMatch
      const start = parseInt(startHour) * 60 + parseInt(startMin)
      const end = parseInt(endHour) * 60 + parseInt(endMin)
      if (isTimeInRange(currentTime, start, end)) {
        return true
      }
    }
  }

  // If we have opening hours but no matching rule, assume closed
  return false
}

function parseDayRange(dayRange: string): string[] {
  const dayAbbrs: { [key: string]: string } = {
    Mo: 'Mo',
    Tu: 'Tu',
    We: 'We',
    Th: 'Th',
    Fr: 'Fr',
    Sa: 'Sa',
    Su: 'Su',
    Monday: 'Mo',
    Tuesday: 'Tu',
    Wednesday: 'We',
    Thursday: 'Th',
    Friday: 'Fr',
    Saturday: 'Sa',
    Sunday: 'Su',
  }

  // Handle ranges like "Mo-Fr" or "Monday-Friday"
  if (dayRange.includes('-')) {
    const [start, end] = dayRange.split('-').map((d) => d.trim())
    const startDay = dayAbbrs[start]
    const endDay = dayAbbrs[end]
    if (startDay && endDay) {
      const allDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
      const startIdx = allDays.indexOf(startDay)
      const endIdx = allDays.indexOf(endDay)
      if (startIdx !== -1 && endIdx !== -1) {
        if (startIdx <= endIdx) {
          return allDays.slice(startIdx, endIdx + 1)
        } else {
          // Handle wrap-around (e.g., Sa-Mo)
          return [...allDays.slice(startIdx), ...allDays.slice(0, endIdx + 1)]
        }
      }
    }
  }

  // Single day or comma-separated days
  return dayRange
    .split(',')
    .map((d) => d.trim())
    .map((d) => dayAbbrs[d] || d)
    .filter(Boolean)
}

function isTimeInRange(current: number, start: number, end: number): boolean {
  if (start <= end) {
    // Normal case: 09:00-18:00
    return current >= start && current <= end
  } else {
    // Overnight: 22:00-02:00
    return current >= start || current <= end
  }
}
