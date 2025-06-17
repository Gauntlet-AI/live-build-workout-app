// lib/openai.js
// OpenAI O3 integration using REST API.

const axios = require('axios')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_ORG_ID = process.env.OPENAI_ORG_ID // optional but recommended
const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID // optional but recommended

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set. OpenAI requests will fail.')
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL_ID = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const MAX_TOKENS = 5000

/**
 * Low-level helper to call OpenAI chat completion API.
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
 * @returns {Promise<string>} assistantResponse
 */
async function callOpenAI(messages) {
  const headers = {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  }
  if (OPENAI_ORG_ID) headers['OpenAI-Organization'] = OPENAI_ORG_ID
  if (OPENAI_PROJECT_ID) headers['OpenAI-Project'] = OPENAI_PROJECT_ID

  const payload = {
    model: MODEL_ID,
    messages,
    max_tokens: MAX_TOKENS,
    // temperature left undefined to use API default
  }

  const resp = await axios.post(OPENAI_API_URL, payload, { headers })
  const assistantMsg = resp.data.choices?.[0]?.message?.content || ''
  return assistantMsg.trim()
}

/**
 * Call OpenAI with basic exponential backoff retry for transient errors.
 * @param {Array} messages
 * @param {number} retries
 */
async function callOpenAIWithRetry(messages, retries = 2) {
  let attempt = 0
  while (attempt <= retries) {
    try {
      return await callOpenAI(messages)
    } catch (err) {
      // Retry on 429 (rate limit) or 5xx errors
      const status = err.response?.status
      if (attempt < retries && (status === 429 || status >= 500)) {
        const delay = 1000 * Math.pow(2, attempt) // exponential backoff
        await new Promise((res) => setTimeout(res, delay))
        attempt += 1
        continue
      }
      throw err // rethrow if not retryable or out of attempts
    }
  }
}

// helper to estimate tokens (rough, 4 chars per token) and truncate materials if needed
function truncateToTokenLimit(str, maxTokens = MAX_TOKENS - 1000) {
  const approxTokens = Math.ceil(str.length / 4)
  if (approxTokens <= maxTokens) return str
  return str.slice(0, maxTokens * 4)
}

/**
 * Generate a workout plan using scraped content and user preferences.
 * (Further prompt design will be implemented in later sub-tasks.)
 * @param {Array<{url: string, content: string}>} scrapedContent
 * @param {object} preferences
 */
async function generateWorkoutPlan(scrapedContent, preferences) {
  // Build condensed materials (limit each to 1000 chars to control token usage)
  const materials = scrapedContent
    .map((item, idx) => {
      const trimmed = item.content.slice(0, 1000)
      return `### Source ${idx + 1} (${item.url})\n${trimmed}`
    })
    .join('\n\n')

  const prefLines = Object.entries(preferences || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  const systemPrompt =
    'You are an expert fitness coach and certified personal trainer. You analyze workout articles and create personalized, safe, and effective workout programs.'

  const userPrompt = `You will receive two sections:\n\n1. MATERIALS - extracted text from workout web pages.\n2. PREFERENCES - the user\'s goals, experience, time, equipment, and notes.\n\nUsing this information, generate a comprehensive 4-week workout plan tailored to the user.\n\nOUTPUT FORMAT (JSON *only*, no markdown):\n{\n  "plan": "<detailed workout plan; organize by weeks/days with exercises, sets, reps, rest>",\n  "summary": "<concise (<=150 words) explanation of how the plan addresses the materials and preferences>"\n}\n\nMATERIALS:\n${truncateToTokenLimit(
    materials
  )}\n\nPREFERENCES:\n${prefLines}`

  const assistantText = await callOpenAIWithRetry([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ])

  // Attempt to parse JSON response
  let plan = assistantText
  let summary = ''
  try {
    const parsed = JSON.parse(assistantText)
    plan = parsed.plan || plan
    summary = parsed.summary || summary
  } catch (err) {
    // Fallback: split by two newlines if JSON parse fails
    const parts = assistantText.split(/\n\n+/)
    summary = parts.slice(-1)[0].slice(0, 200) + '...'
  }

  return { plan, summary }
}

module.exports = {
  callOpenAI,
  callOpenAIWithRetry,
  generateWorkoutPlan, // will be refined in 4.2/4.3
}
