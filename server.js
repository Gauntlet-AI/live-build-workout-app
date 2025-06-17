// server.js
// Basic Express server setup for AI Workout Analyzer (Sub-task 2.1)

require('dotenv').config()
const path = require('path')
const express = require('express')
const cors = require('cors')
const {
  getWorkoutHistory,
  saveWorkoutSummary,
  deleteWorkoutSummary,
  getPreferences,
  savePreferences,
} = require('./lib/storage')
const {
  validateAnalyzeRequest,
  validateSaveRequest,
  validatePreferencesRequest,
} = require('./lib/validators')

const app = express()

// Middleware
const corsOptions = {
  origin: 'http://localhost:3000', // allow requests from local frontend
  methods: ['GET', 'POST'],
}
app.use(cors(corsOptions))
app.use(express.json())

// Serve static files from /public
const publicDir = path.join(__dirname, 'public')
app.use(express.static(publicDir))

// Simple health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// GET /api/history - return saved workout summaries
app.get('/api/history', (_req, res) => {
  try {
    const history = getWorkoutHistory()
    res.json({ history })
  } catch (err) {
    console.error('Error in /api/history:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/preferences - return saved user preferences
app.get('/api/preferences', (_req, res) => {
  try {
    const prefs = getPreferences()
    res.json({ preferences: prefs })
  } catch (err) {
    console.error('Error in /api/preferences:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/preferences - save user preferences
app.post('/api/preferences', validatePreferencesRequest, (req, res) => {
  try {
    const prefs = req.body
    if (!prefs || typeof prefs !== 'object') {
      return res.status(400).json({ error: 'Invalid preferences payload' })
    }
    const saved = savePreferences(prefs)
    res.json({ preferences: saved })
  } catch (err) {
    console.error('Error in /api/preferences [POST]:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/analyze - Analyze workouts and generate plan
app.post('/api/analyze', validateAnalyzeRequest, async (req, res) => {
  try {
    const { urls, preferences } = req.body

    // Basic validation
    if (!Array.isArray(urls) || urls.length === 0 || urls.length > 5) {
      return res.status(400).json({ error: 'Please provide 1-5 workout URLs.' })
    }

    const validUrls = urls.filter((u) => typeof u === 'string' && /^https?:\/\//.test(u))
    if (validUrls.length !== urls.length) {
      return res.status(400).json({ error: 'One or more URLs are invalid.' })
    }

    // Placeholder scraping & AI analysis
    const { scrapeWorkouts } = require('./lib/scraper')
    const { generateWorkoutPlan } = require('./lib/openai')

    const scraped = await scrapeWorkouts(validUrls)
    const scrapingSuccess = scraped.filter((s) => s.success)

    const aiResponse = await generateWorkoutPlan(scrapingSuccess, preferences)

    res.json({
      plan: aiResponse.plan,
      summary: aiResponse.summary,
      processedUrls: scraped,
    })
  } catch (err) {
    console.error('Error in /api/analyze:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/save - save workout analysis summary
app.post('/api/save', validateSaveRequest, (req, res) => {
  try {
    const summary = req.body
    if (!summary || typeof summary !== 'object') {
      return res.status(400).json({ error: 'Invalid summary payload' })
    }
    const history = saveWorkoutSummary(summary)
    res.json({ history })
  } catch (err) {
    console.error('Error in /api/save:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/history/:ts - delete workout summary by timestamp
app.delete('/api/history/:ts', (req, res) => {
  try {
    const ts = Number(req.params.ts)
    if (!ts) {
      return res.status(400).json({ error: 'Invalid timestamp' })
    }
    const history = deleteWorkoutSummary(ts)
    res.json({ history })
  } catch (err) {
    console.error('Error in DELETE /api/history:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/feedback - add thumbs up/down rating
app.post('/api/feedback', (req, res) => {
  try {
    const { timestamp, rating } = req.body
    if (!timestamp || ![1, -1].includes(rating)) {
      return res.status(400).json({ error: 'Invalid feedback payload' })
    }
    const history = require('./lib/storage').addFeedback(timestamp, rating)
    res.json({ history })
  } catch (err) {
    console.error('Error in /api/feedback:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`AI Workout Analyzer server running on http://localhost:${PORT}`)
})

module.exports = app
