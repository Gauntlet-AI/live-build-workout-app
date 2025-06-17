// lib/scraper.js
// Placeholder implementation for scraping workout content from URLs using Cheerio.

const axios = require('axios')
const cheerio = require('cheerio')

const DEFAULT_TIMEOUT_MS = 10000 // 10-second timeout per request
const USER_AGENT = 'Mozilla/5.0 (compatible; AIWorkoutAnalyzer/1.0; +http://localhost)'

/**
 * Fetch and clean text content from a single URL.
 * @param {string} url
 * @returns {Promise<{url: string, success: boolean, content?: string, error?: string}>}
 */
async function scrapeSingle(url) {
  try {
    const resp = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: DEFAULT_TIMEOUT_MS,
    })

    const $ = cheerio.load(resp.data)

    // Remove unwanted elements
    $('script, style, nav, header, footer, noscript, iframe').remove()

    // Extract headings, paragraphs, and list items for richer workout content
    const headings = $('h1, h2, h3')
      .map((_, el) => $(el).text().trim())
      .get()

    const paragraphs = $('p')
      .map((_, el) => $(el).text().trim())
      .get()

    const listItems = $('li')
      .map((_, el) => $(el).text().trim())
      .get()

    // Combine content sections and condense whitespace
    const combined = [...headings, ...paragraphs, ...listItems]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    return { url, success: true, content: combined }
  } catch (err) {
    return {
      url,
      success: false,
      error: err.code === 'ECONNABORTED' ? 'Timeout exceeded' : err.message,
    }
  }
}

/**
 * Retry wrapper to attempt scraping a URL up to maxRetries times.
 * @param {string} url
 * @param {number} maxRetries
 * @returns {Promise<{url: string, success: boolean, content?: string, error?: string}>}
 */
async function scrapeWithRetry(url, maxRetries = 1) {
  let attempt = 0
  let result
  while (attempt <= maxRetries) {
    result = await scrapeSingle(url)
    if (result.success) break
    attempt += 1
  }
  return result
}

/**
 * Scrape workout content from multiple URLs in parallel.
 * @param {string[]} urls
 * @returns {Promise<Array<{url: string, success: boolean, content?: string, error?: string}>>}
 */
async function scrapeWorkouts(urls) {
  const results = await Promise.all(urls.map((u) => scrapeWithRetry(u, 1)))
  return results
}

module.exports = { scrapeWorkouts }
