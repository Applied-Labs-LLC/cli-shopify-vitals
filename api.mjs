import { JSDOM } from 'jsdom'
import dotenv from 'dotenv'
dotenv.config()


/**
 * Make API Calls
 *
 * @async
 * @param {{ tests?: {}; device?: string; url: any; }} param0
 * @param {{}} [param0.tests=['performance', 'accessibility', 'best-practices', 'seo']]
 * @param {string} [param0.device='mobile']
 * @param {*} param0.url
 * @returns {unknown}
 */
export const fetchApi = async ({
  tests = ['performance', 'accessibility', 'best-practices', 'seo'],
  device = 'mobile',
  url
}) => {
  if (process.env.API_KEY == null) {
    return {
      results: null,
      error: "Application not configured correct, missing `API_KEY` environment variable.",
    }
  }

  const domain = 'https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed'
  const categories = tests.map(item => `category=${item}`).join('&')
  const params = [
    categories,
    `strategy=${device}`,
    `key=${process.env.API_KEY}`
  ].map(item => item).join('&').trim()
  const endpoint = `${domain}?url=${url}&${params}`

  try {
    const response = await fetch(
      endpoint,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )

    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      const results = await response.json()

      return {
        results,
        error: null,
      }
    } else {
      return {
        results: null,
        error: "Google's servers failed to process the request, try again.",
      }
    }
  } catch (error) {
    return {
      results: null,
      error: error.toString(),
    }
  }
}


/**
 * Fetch and parse HTML
 *
 * @async
 * @param {{ url: any; }} param0
 * @param {*} param0.url
 * @returns {unknown}
 */
export const fetchHtml = async ({ url }) => {
  try {

    const response = await fetch(url)
    const text = await response.text()
    const dom = new JSDOM(text)

    return {
      html: dom.window.document,
      url,
      error: null,
    }

  } catch (error) {

    console.error(`Error fetching ${url}:`, error)

    return {
      html: null,
      url,
      error: 'Error fetching title'
    }

  }
}
