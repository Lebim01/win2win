export function diffNow(endISO?: string) {
  if (!endISO) return { ms: 0, days: 0, hours: 0, minutes: 0, expired: true, pct: 0 }
  const end = new Date(endISO).getTime()
  const now = Date.now()
  const ms = Math.max(0, end - now)
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const totalPeriodMs = (() => {
    // try derive period length from currentPeriodStart
    return ms > 0
      ? end - new Date(endISO).setMonth(new Date(endISO).getMonth() - 1)
      : 30 * 24 * 3600 * 1000
  })()
  const pct = totalPeriodMs ? Math.min(100, Math.max(0, (ms / totalPeriodMs) * 100)) : 0
  return {
    ms,
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    expired: ms === 0,
    pct: Math.round(pct),
  }
}
