# AI Workout Analyzer

A local web application that analyzes workout content from user-supplied URLs and generates personalized workout plans using AI (OpenAI O3). Runs entirely on `localhost:3000` with zero configuration beyond installing dependencies and providing an API key.

## Features

- Paste **1-5 workout URLs**
- Fill in quick questionnaire for goals, experience, available time & equipment
- AI-generated personalized workout plan & summary
- Saves analysis summaries and user preferences locally (JSON files)
- Tailwind-powered responsive UI

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | Node.js, Express, Axios, Cheerio, OpenAI O3 |
| Frontend   | Vanilla HTML/CSS/JS, Tailwind CSS |
| Storage    | Local JSON files (`data/` folder) |

## Prerequisites

- Node.js (LTS or current version)
- An OpenAI **O3** API key

## Setup

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Create environment file
cp env.example .env
#   then add your OpenAI API key inside .env

# 3. Start the development server (will serve on http://localhost:3000)
node server.js
```

## Project Structure

```
├── public/        # Frontend assets (HTML, CSS, JS)
├── lib/           # Backend helper modules (scraper, openai, storage)
├── data/          # JSON storage for workouts & preferences
├── .gitignore     # Ignored files and directories
├── env.example    # Template environment variables
└── server.js      # Express server (to be implemented)
```

## Development Scripts (coming soon)
- **`npm run dev`** – concurrently runs Tailwind CLI and nodemon for live reload

## License
MIT

---
> Built with ❤️ and AI assistance. # live-build-workout-app
