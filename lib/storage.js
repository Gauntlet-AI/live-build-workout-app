// lib/storage.js
// Simple JSON file storage utility for workouts and preferences.

const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')
const workoutsFile = path.join(dataDir, 'workouts.json')
const preferencesFile = path.join(dataDir, 'preferences.json')

function ensureDataFiles() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(workoutsFile)) {
    fs.writeFileSync(workoutsFile, '[]', 'utf-8')
  }
  if (!fs.existsSync(preferencesFile)) {
    fs.writeFileSync(preferencesFile, '{}', 'utf-8')
  }
}

ensureDataFiles()

// Simple in-memory promise queue to serialize writes
let writeQueue = Promise.resolve()

function enqueueWrite(fn) {
  writeQueue = writeQueue.then(() => fn()).catch(() => {})
  return writeQueue
}

function isValidSummary(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.summary === 'string' &&
    obj.summary.length > 0 &&
    typeof obj.timestamp === 'number'
  )
}

// ---- Workout History ----
function getWorkoutHistory() {
  const raw = fs.readFileSync(workoutsFile, 'utf-8')
  return JSON.parse(raw)
}

function saveWorkoutSummary(summary) {
  if (!isValidSummary(summary)) {
    throw new Error('Invalid workout summary payload')
  }

  return enqueueWrite(() => {
    const history = getWorkoutHistory()
    history.unshift(summary)
    while (history.length > 50) history.pop()
    fs.writeFileSync(workoutsFile, JSON.stringify(history, null, 2))
    return history
  })
}

// Delete summary by timestamp
function deleteWorkoutSummary(timestamp) {
  return enqueueWrite(() => {
    const history = getWorkoutHistory()
    const filtered = history.filter((h) => h.timestamp !== timestamp)
    fs.writeFileSync(workoutsFile, JSON.stringify(filtered, null, 2))
    return filtered
  })
}

// Add rating (1 or -1) to an entry
function addFeedback(timestamp, rating) {
  return enqueueWrite(() => {
    const history = getWorkoutHistory()
    const idx = history.findIndex((h) => h.timestamp === timestamp)
    if (idx !== -1) {
      history[idx].rating = rating
      fs.writeFileSync(workoutsFile, JSON.stringify(history, null, 2))
    }
    return history
  })
}

// ---- Preferences ----
function getPreferences() {
  const raw = fs.readFileSync(preferencesFile, 'utf-8')
  return JSON.parse(raw)
}

function savePreferences(prefs) {
  fs.writeFileSync(preferencesFile, JSON.stringify(prefs, null, 2))
  return prefs
}

module.exports = {
  getWorkoutHistory,
  saveWorkoutSummary,
  deleteWorkoutSummary,
  getPreferences,
  savePreferences,
  addFeedback,
}
