import { categories } from './categories.mjs'

/**
 * Convert ratings to what is shown on PSI website
 *
 * @type {{ fast: string; average: string; slow: string; }}
 */
const ratings = {
  fast: 'Good',
  average: 'Moderate',
  slow: 'Poor'
}


/**
 * Determine if CWV is pass or fail
 *
 * @param {{ cls: any; fid: any; lcp: any; }} param0
 * @param {*} param0.cls
 * @param {*} param0.fid
 * @param {*} param0.lcp
 * @returns {("Unknown" | "Passed" | "Failed")}
 */
function assessment({ cls, fid, lcp }) {
  // Check if any null values
  if (cls == null || fid == null || lcp == null) return 'Unknown'

  // Determine if passed
  if (
    cls === ratings.fast &&
    fid === ratings.fast &&
    lcp === ratings.fast
  ) return 'Passed'

  return 'Failed'
}


/**
 * Return the rating label seen on PSI
 *
 * @param {*} str
 * @returns {string}
 */
function category(str) {
  let rating = null
  switch (str) {
    case 'FAST':
      rating = ratings.fast
      break

    case 'AVERAGE':
      rating = ratings.average
      break

    case 'SLOW':
      rating = ratings.slow
      break

    default:
      rating = null
      break
  }
  return rating
}


/**
 * Convert Rating to Whole Number
 *
 * @param {*} num
 * @returns {*}
 */
function rating(num) {
  if (num == null || num == undefined) return null
  return Math.round(num * 100)
}


/**
 * Parse Lighthouse Audits
 *
 * @param {*} data
 * @returns {{}}
 */
export const parseAudits = (data) => {
  const results = []

  // Early exit
  if (
    data.lighthouseResult === undefined ||
    data.lighthouseResult.audits == undefined
  ) return results

  // Push items into array
  const lighthouse = data.lighthouseResult
  const audits = lighthouse.audits

  Object.keys(audits).forEach(key => {
    const audit = audits[key]

    if (audit.score == null) return
    if (parseFloat(audit.score) >= 0.5) return
    if (results.some(obj => obj['Title'] === audit.title)) return

    results.push({
      ['Category']: categories[audit.id] || null,
      ['Title']: audit?.title || null,
      ['Potential Savings']: audit?.displayValue || null,
      ['Description']: audit?.description || null,
      ['Score']: audit.score,
    })
  })

  // Return while removing duplicates
  return results
}


/**
 * Parse Core Metrics
 *
 * @param {{ data: any; device: any; route: any; title: any; url: any; }} param0
 * @param {*} param0.data
 * @param {*} param0.device
 * @param {*} param0.route
 * @param {*} param0.title
 * @param {*} param0.url
 * @returns {{ Type: any; Device: any; Date: any; URL: any; "Core Web Vitals": string; CLS: string; FCP: string; FID: string; LCP: string; INP: string; TTFB: string; Accessibility: any; "Best Practices": any; Performance: an...}
 */
export const parseMetrics = ({ data, device, route, title, url }) => {
  // The keys are written as how the columns should appear in a table.
  const results = {
    // Meta Data
    ['Page Name']: title || null,
    ['Type']: route,
    ['Device']: device,
    ['Date']: new Date(data.analysisUTCTimestamp).toLocaleDateString(),
    ['URL']: url,

    // Overall Rating
    ['Core Web Vitals']: 'Not enough data',

    // CWV Metrics
    ['CLS']: 'Not enough data',
    ['FCP']: 'Not enough data',
    ['FID']: 'Not enough data',
    ['LCP']: 'Not enough data',
    ['INP']: 'Not enough data',
    ['TTFB']: 'Not enough data',

    // Lighthouse
    ['Accessibility']: null,
    ['Best Practices']: null,
    ['Performance']: null,
    ['SEO']: null,
  }

  // Core Web Vitals checks
  if (data.loadingExperience !== undefined && data.loadingExperience.metrics !== undefined) {
    const metrics = data.loadingExperience.metrics

    results['Core Web Vitals'] = assessment({
      cls: category(metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.category) || null,
      fid: category(metrics.FIRST_INPUT_DELAY_MS?.category) || null,
      lcp: category(metrics.LARGEST_CONTENTFUL_PAINT_MS?.category) || null,
    })

    results['CLS'] = category(metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.category) || null
    results['FCP'] = category(metrics.FIRST_CONTENTFUL_PAINT_MS?.category) || null
    results['FID'] = category(metrics.FIRST_INPUT_DELAY_MS?.category) || null
    results['LCP'] = category(metrics.LARGEST_CONTENTFUL_PAINT_MS?.category) || null
    results['INP'] = category(metrics.INTERACTION_TO_NEXT_PAINT?.category) || null
    results['TTFB'] = category(metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.category) || null
  }

  // Lighthouse checks
  if (data.lighthouseResult !== undefined && data.lighthouseResult.categories !== undefined) {
    const lighthouse = data.lighthouseResult.categories

    results['Accessibility'] = rating(lighthouse.accessibility?.score) || null
    results['Best Practices'] = rating(lighthouse['best-practices']?.score) || null
    results['Performance'] = rating(lighthouse.performance?.score) || null
    results['SEO'] = rating(lighthouse.seo?.score) || null
  }

  return results
}