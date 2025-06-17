# Tasks: AI Workout Analyzer

## Relevant Files

- `package.json` - Node.js project configuration with dependencies (express, openai, cheerio, axios, cors, dotenv)
- `server.js` - Main Express server with API endpoints and static file serving
- `.env` - Environment variables (OpenAI API key, port configuration)
- `data/workouts.json` - Storage for workout analysis summaries (last 50 entries)
- `data/preferences.json` - User preferences storage for form auto-population
- `public/index.html` - Main HTML page with form and results display
- `public/style.css` - Tailwind CSS styling and custom styles
- `public/script.js` - Frontend JavaScript for user interactions and API calls
- `lib/scraper.js` - Web scraping functionality using Cheerio
- `lib/openai.js` - OpenAI O3 integration and prompt management
- `lib/storage.js` - JSON file read/write operations with data validation
- `README.md` - Setup and usage instructions

### Notes

- Project uses current Node.js version with Express framework
- Tailwind CSS (current version) for styling with custom CSS as needed
- OpenAI O3 model integration (user will provide API key and specifics)
- Local JSON file storage with 50-entry retention limit
- Separate frontend/backend task organization

## Tasks

- [x] 1.0 Project Setup & Infrastructure
  - [x] 1.1 Initialize Node.js project with `npm init -y`
  - [x] 1.2 Install backend dependencies (express, openai, cheerio, axios, cors, dotenv)
  - [x] 1.3 Install Tailwind CSS via CDN or npm for current version
  - [x] 1.4 Create project directory structure (public/, lib/, data/)
  - [x] 1.5 Set up env.example file (template) with OpenAI API key placeholder
  - [x] 1.6 Create .gitignore file (node_modules, .env, data/*.json)
  - [x] 1.7 Initialize basic README.md with setup instructions

- [x] 2.0 Backend API Development
  - [x] 2.1 Create basic Express server in server.js with static file serving
  - [x] 2.2 Set up CORS middleware for local development
  - [x] 2.3 Implement POST /api/analyze endpoint (receive URLs + preferences)
  - [x] 2.4 Implement GET /api/history endpoint (return last 50 workout summaries)
  - [x] 2.5 Implement POST /api/save endpoint (save workout analysis summary)
  - [x] 2.6 Implement GET /api/preferences endpoint (return saved user preferences)
  - [x] 2.7 Implement POST /api/preferences endpoint (save user preferences)
  - [x] 2.8 Add request validation middleware for all endpoints

- [x] 3.0 Web Scraping & Content Analysis
  - [x] 3.1 Create lib/scraper.js with Cheerio-based URL content extraction
  - [x] 3.2 Implement timeout handling (5-10 second limit per URL)
  - [x] 3.3 Add user-agent headers to avoid blocking
  - [x] 3.4 Create content cleaning function (remove scripts, ads, navigation)
  - [x] 3.5 Handle different website structures (title, paragraphs, lists)
  - [x] 3.6 Return structured data with success/failure status per URL
  - [x] 3.7 Implement retry logic for failed requests (1 retry max)

- [x] 4.0 OpenAI O3 Integration
  - [x] 4.1 Create lib/openai.js with O3 client configuration
  - [x] 4.2 Design effective prompt template for workout analysis
  - [x] 4.3 Implement function to combine scraped content + user preferences
  - [x] 4.4 Add token limit management (reasonable cost control)
  - [x] 4.5 Implement API error handling and retry logic
  - [x] 4.6 Parse and format AI response into structured workout plan
  - [x] 4.7 Create analysis summary extraction (for storage)

- [x] 5.0 Frontend Development
  - [x] 5.1 Create public/index.html with semantic HTML structure
  - [x] 5.2 Set up Tailwind CSS classes for responsive layout
  - [x] 5.3 Build URL input section (dynamic add/remove 1-5 URLs)
  - [x] 5.4 Create user preferences form (goals, experience, time, equipment)
  - [x] 5.5 Implement form validation (URL format, required fields)
  - [x] 5.6 Add loading states and progress indicators
  - [x] 5.7 Create results display section for workout plans
  - [x] 5.8 Build workout history view with previous analyses
  - [x] 5.9 Add export functionality (copy to clipboard)
  - [x] 5.10 Implement thumbs up/down feedback system

- [x] 6.0 Data Storage & Management
  - [x] 6.1 Create lib/storage.js with JSON file read/write functions
  - [x] 6.2 Initialize data/workouts.json with empty array structure
  - [x] 6.3 Initialize data/preferences.json with default user preferences
  - [x] 6.4 Implement 50-entry retention limit for workout history
  - [x] 6.5 Add data validation for saved workout summaries
  - [x] 6.6 Implement concurrent read/write protection
  - [x] 6.7 Add backup/recovery logic for corrupted JSON files

- [x] 7.0 Error Handling & User Feedback
  - [x] 7.1 Add comprehensive error handling for all API endpoints
  - [x] 7.2 Implement user-friendly error messages for scraping failures
  - [x] 7.3 Create fallback UI for when all URLs fail to scrape
  - [x] 7.4 Add network error handling with retry suggestions
  - [x] 7.6 Add client-side validation feedback
  - [x] 7.7 Create success confirmation messages and animations

- [x] 8.0 Testing & Polish
  - [x] 8.1 Test with various fitness website URLs (5-10 different sites)
  - [x] 8.2 Verify data persistence across browser sessions
  - [x] 8.3 Test all error scenarios (invalid URLs, API failures, etc.)
  - [x] 8.4 Validate responsive design on mobile and desktop
  - [x] 8.5 Performance testing (multiple concurrent URL scraping)
  - [x] 8.6 User experience testing (form flow, results display)
  - [x] 8.7 Final code cleanup and documentation 