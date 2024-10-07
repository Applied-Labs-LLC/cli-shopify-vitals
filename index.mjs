import * as p from '@clack/prompts'
import { fileName, saveCsv } from './save.mjs'
import {
  buildRoutes,
  formatStr,
  pageTitles,
  removeDuplicates,
  time,
} from './utils.mjs'
import { runTests } from './tests.mjs'

/**
 * Init
 */
p.intro(formatStr(`Core Web Vitals for Shopify stores`))

p.note(
  formatStr(`
    The test requires you to specify a product page URL.
    This is the only URL that can't be determined from the domain.
  `)
)


/**
 * Prompts
 */
const group = await p.group(
  {
    product: () => p.text({
        message: 'Provide product page URL (other pages will be inferred)',
        placeholder: 'https://domain.com/products/shoe',
        validate(value) {
          if (value.length === 0) return `Value is required!`
          if (!value.includes('/products/')) return 'Invalid product URL'
        },
      }),
    routes: () => p.multiselect({
        message: 'Which pages do you want to test?',
        options: [
          { value: 'Cart', label: 'Cart' },
          { value: 'Collection', label: 'Collection' },
          { value: 'Home', label: 'Home' },
          { value: 'Product', label: 'Product' },
        ],
        initialValues: ['Home', 'Collection', 'Product', 'Cart'],
        required: true,
      }),
    devices: () => p.multiselect({
        message: 'Which devices do you want to test?',
        options: [
          { value: 'Desktop', label: 'Desktop' },
          { value: 'Mobile', label: 'Mobile' },
        ],
        initialValues: ['Desktop', 'Mobile'],
        required: true,
      }),
  },
  {
    onCancel: () => {
      p.cancel('No tests run')
      process.exit(0)
    }
  }
)


/**
 * Fetch Results
 */
// Setup
const s = p.spinner()
const url = new URL(group.product)
const routes = buildRoutes({ group, url })

// Get page titles
const titles = await pageTitles(routes)

// File names
const fileAudits = fileName({ domain: url.host, type: 'Audits' })
const fileResults = fileName({ domain: url.host })

// Result variables
const results = []
const audits = []
let totalTime = 0

// Run Desktop Tests
if (group.devices.includes('Desktop')) {
  s.start('Running desktop tests')

  const desktop = await runTests({ device: 'Desktop', routes, titles })
  results.push(desktop.results)
  audits.push(desktop.audits)

  totalTime = totalTime + desktop.duration.value

  s.stop(`Desktop tests completed in ${desktop.duration.time}`)

  if (desktop.errors.length > 0) desktop.errors.forEach(error => p.note(error))
}

// Run Mobile Tests
if (group.devices.includes('Mobile')) {
  s.start('Running mobile tests')

  const mobile = await runTests({ device: 'Mobile', routes, titles })
  results.push(mobile.results)
  audits.push(mobile.audits)

  totalTime = totalTime + mobile.duration.value

  s.stop(`Mobile tests completed in ${mobile.duration.time}`)

  if (mobile.errors.length > 0) mobile.errors.forEach(error => p.note(error))
}


/**
 * Save file
 */
saveCsv(results.flat(), fileResults)
saveCsv(
  removeDuplicates({ array: audits.flat(), property: 'Title' }),
  fileAudits,
)


/**
 * Complete
 */
p.outro(`All tests completed in ${time(totalTime)} and files saved to desktop.`)

