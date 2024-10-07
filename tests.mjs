import { formatStr, time } from './utils.mjs'
import { fetchApi } from './api.mjs'
import { parseAudits, parseMetrics } from './parse.mjs'


/**
 * Run PSI Tests
 *
 * @async
 * @param {{ device?: string; routes: any; titles: any; }} param0
 * @param {string} [param0.device='mobile']
 * @param {*} param0.routes
 * @param {*} param0.titles
 * @returns {unknown}
 */
export const runTests = async ({ device = 'mobile', routes, titles }) => {
  const start = new Date().getTime()
  const results = []
  const errors = []
  const audits = []

  const promises = Object.keys(routes).map(async (route) => {
    const data = await fetchApi({ url: routes[route], device })

    if (data.error === null) {

      // Parse Results
      results.push(
        parseMetrics({
          data: data.results,
          url: routes[route],
          title: titles[route],
          route,
          device,
        })
      )

      // Parse Audits
      audits.push(parseAudits(data.results))

    } else {

      errors.push(
        formatStr(
          `
            ${route.toUpperCase()} TEST FAILED

            Error Message:
            ${data.error}

            Manual PageSpeed Test URL:
            https://pagespeed.web.dev/analysis?url=${routes[route]}
          `
        )
      )

    }
  })

  await Promise.all(promises)

  const end = new Date().getTime()
  const duration = (end - start)

  return {
    results: results.flat(),
    audits: audits.flat(),
    errors,
    duration: {
      value: parseFloat(duration),
      time: time(duration),
    },
  }
}