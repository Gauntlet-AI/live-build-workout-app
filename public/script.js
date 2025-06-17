// public/script.js
// Frontend interactions for AI Workout Analyzer

const MAX_URLS = 5
const urlFieldsContainer = document.getElementById('url-fields')
const addUrlBtn = document.getElementById('add-url')
const analyzeForm = document.getElementById('analyze-form')
const resultsSection = document.getElementById('results-section')
const planOutput = document.getElementById('plan-output')
const summaryOutput = document.getElementById('summary-output')
const historySection = document.getElementById('history-section')
const historyList = document.getElementById('history-list')
const copyBtn = document.getElementById('copy-btn')
const downloadBtn = document.getElementById('download-btn')
const thumbsUpBtn = document.getElementById('thumbs-up')
const thumbsDownBtn = document.getElementById('thumbs-down')
let lastTimestamp = null

// Utility to create a URL input field
function createUrlInput(index) {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex'

  const input = document.createElement('input')
  input.type = 'url'
  input.placeholder = `Workout URL #${index + 1}`
  input.required = true
  input.className = 'flex-grow border rounded p-2'

  const removeBtn = document.createElement('button')
  removeBtn.type = 'button'
  removeBtn.textContent = '✕'
  removeBtn.className = 'ml-2 text-red-500 hover:text-red-700'
  removeBtn.addEventListener('click', () => {
    urlFieldsContainer.removeChild(wrapper)
    updateUrlPlaceholders()
  })

  wrapper.appendChild(input)
  wrapper.appendChild(removeBtn)
  return wrapper
}

function updateUrlPlaceholders() {
  const inputs = urlFieldsContainer.querySelectorAll('input')
  inputs.forEach((inp, idx) => (inp.placeholder = `Workout URL #${idx + 1}`))
  // Disable add button if max reached
  addUrlBtn.disabled = inputs.length >= MAX_URLS
}

// Initial one URL field
urlFieldsContainer.appendChild(createUrlInput(0))
updateUrlPlaceholders()

addUrlBtn.addEventListener('click', () => {
  const count = urlFieldsContainer.querySelectorAll('input').length
  if (count < MAX_URLS) {
    urlFieldsContainer.appendChild(createUrlInput(count))
    updateUrlPlaceholders()
  }
})

function getFormData() {
  const urls = Array.from(urlFieldsContainer.querySelectorAll('input'))
    .map((inp) => inp.value.trim())
    .filter(Boolean)

  const prefs = {
    goal: document.getElementById('goal').value.trim(),
    experience: document.getElementById('experience').value,
    time: document.getElementById('time').value,
    equipment: document.getElementById('equipment').value.trim(),
    notes: document.getElementById('notes').value.trim(),
  }
  return { urls, preferences: prefs }
}

function setLoading(state) {
  const btn = analyzeForm.querySelector('button[type="submit"]')
  btn.disabled = state
  btn.textContent = state ? 'Generating...' : 'Generate Plan'
}

analyzeForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const data = getFormData()
  if (data.urls.length === 0) {
    alert('Please enter at least one workout URL.')
    return
  }
  setLoading(true)
  try {
    const resp = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!resp.ok) throw new Error(await resp.text())
    const json = await resp.json()
    planOutput.textContent = json.plan
    summaryOutput.textContent = json.summary
    resultsSection.classList.remove('hidden')

    lastTimestamp = Date.now()
    await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: json.summary, timestamp: lastTimestamp }),
    })

    // feedback buttons enable
    thumbsUpBtn.disabled = false
    thumbsDownBtn.disabled = false

    loadHistory()
  } catch (err) {
    console.error(err)
    alert('Error generating workout plan. See console for details.')
  } finally {
    setLoading(false)
  }
})

async function loadHistory() {
  try {
    const resp = await fetch('/api/history')
    if (!resp.ok) return
    const data = await resp.json()
    historyList.innerHTML = ''
    data.history.forEach((item) => {
      const li = document.createElement('li')
      li.className = 'border rounded p-2 flex justify-between items-start'
      const span = document.createElement('span')
      span.textContent = `${new Date(item.timestamp).toLocaleString()}: ${item.summary}`
      const delBtn = document.createElement('button')
      delBtn.textContent = 'Delete'
      delBtn.className = 'text-sm text-red-600 hover:underline'
      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this entry?')) return
        await fetch(`/api/history/${item.timestamp}`, { method: 'DELETE' })
        loadHistory()
      })
      li.appendChild(span)
      li.appendChild(delBtn)
      historyList.appendChild(li)
    })
    if (data.history.length) {
      historySection.classList.remove('hidden')
    }
  } catch (err) {
    console.error(err)
  }
}

// Load preferences & history on page load
window.addEventListener('DOMContentLoaded', async () => {
  loadHistory()
  try {
    const resp = await fetch('/api/preferences')
    if (!resp.ok) return
    const data = await resp.json()
    const prefs = data.preferences || {}
    document.getElementById('goal').value = prefs.goal || ''
    document.getElementById('experience').value = prefs.experience || 'Beginner'
    document.getElementById('time').value = prefs.time || '30min'
    document.getElementById('equipment').value = prefs.equipment || ''
    document.getElementById('notes').value = prefs.notes || ''
  } catch (err) {
    console.error(err)
  }
})

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(planOutput.textContent)
    alert('Workout plan copied to clipboard')
  } catch (err) {
    alert('Copy failed')
  }
})

// Download as text file
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([planOutput.textContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `workout-plan-${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
})

function sendFeedback(rating) {
  if (!lastTimestamp) return
  fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timestamp: lastTimestamp, rating }),
  })
  thumbsUpBtn.disabled = true
  thumbsDownBtn.disabled = true
}

thumbsUpBtn.addEventListener('click', () => sendFeedback(1))
thumbsDownBtn.addEventListener('click', () => sendFeedback(-1))
