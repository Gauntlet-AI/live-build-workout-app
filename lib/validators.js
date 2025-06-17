// lib/validators.js
// Simple request validation middleware functions.

function validateAnalyzeRequest(req, res, next) {
  const { urls, preferences } = req.body || {}
  if (!Array.isArray(urls) || urls.length === 0 || urls.length > 5) {
    return res.status(400).json({ error: 'Please provide 1-5 workout URLs.' })
  }
  const urlRegex = /^https?:\/\//i
  const invalid = urls.find((u) => typeof u !== 'string' || !urlRegex.test(u))
  if (invalid) {
    return res.status(400).json({ error: 'One or more URLs are invalid.' })
  }
  // preferences can be optional but must be an object if provided
  if (preferences && typeof preferences !== 'object') {
    return res.status(400).json({ error: 'Preferences must be an object.' })
  }
  next()
}

function validateSaveRequest(req, res, next) {
  const { plan, summary } = req.body || {}
  if (typeof plan !== 'string' || typeof summary !== 'string') {
    return res.status(400).json({ error: 'Summary must include plan and summary strings.' })
  }
  next()
}

function validatePreferencesRequest(req, res, next) {
  const prefs = req.body
  if (!prefs || typeof prefs !== 'object') {
    return res.status(400).json({ error: 'Invalid preferences payload.' })
  }
  next()
}

module.exports = {
  validateAnalyzeRequest,
  validateSaveRequest,
  validatePreferencesRequest,
}
