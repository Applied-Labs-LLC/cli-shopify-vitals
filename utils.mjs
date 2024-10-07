import { fetchHtml } from './api.mjs'


/**
 * Build Store Routes
 *
 * @param {{ group: any; url: any; }} param0
 * @param {*} param0.group
 * @param {*} param0.url
 * @returns {{}}
 */
export const buildRoutes = ({ group, url }) => {
  const routes = {}

  group.routes.forEach(route => {
    switch (route.toLowerCase()) {
      case 'home':
        Object.assign(routes, { home: url.origin })
        break

      case 'collection':
        Object.assign(routes, { collection: `${url.origin}/collections/all` })
        break

      case 'product':
        Object.assign(routes, { product: group.product })
        break

      case 'cart':
        Object.assign(routes, { cart: `${url.origin}/cart` })
        break
    }
  })

  return routes
}


/**
 * Stringify JSON for files
 *
 * @param {*} obj
 * @returns {*}
 */
export const formatJson = (obj) => JSON.stringify(obj, null, 2)


/**
 * Remove spaces at beginning of lines but keep line breaks
 *
 * @param {*} message
 * @returns {*}
 */
export const formatStr = (message) => (message.replaceAll(/^[ \t]+/gm, '').trim())


/**
 * Page Titles
 *
 * @async
 * @param {*} routes
 * @returns {unknown}
 */
export const pageTitles = async (routes) => {
  const titles = { ...routes }

  const promises = Object.keys(routes).map(async (route) => {
    const res = await fetchHtml({ url: routes[route] })

    if (res.html == null) return

    titles[route] = formatStr(res.html.querySelector('title').textContent)
  })

  await Promise.all(promises)
  return titles
}


/**
 * Remove duplicate items from array
 *
 * @param {{ array: any; property: any; }} param0
 * @param {*} param0.array
 * @param {*} param0.property
 * @returns {*}
 */
export const removeDuplicates = ({ array, property }) => {
  const seen = new Set()
  const filtered = array.filter(item => {
    const duplicate = seen.has(item[property])
    seen.add(item[property])
    return !duplicate
  })
  return filtered.flat()
}


/**
 * Convert Milliseconds to Time Output
 *
 * @param {*} num
 * @returns {string}
 */
export const time = (num) => {
  const ms = parseFloat(num)
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  if (seconds === 0) return `${((ms / 1000) % 60).toFixed(2)}s`

  return `${seconds}s`
}