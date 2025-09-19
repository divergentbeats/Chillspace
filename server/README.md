# Chillspace Backend API

This backend provides API endpoints for mood analysis using the Gemini CLI, with results saved to Firestore.

## Setup

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Set up Firebase:
   - Ensure you have a Firebase project.
   - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your service account key JSON file.
   - Update the `databaseURL` in `index.js` with your Firebase project ID.

3. Install Gemini CLI:
   - Download and install the Gemini CLI from Google.
   - Ensure it's in your PATH or set `GEMINI_CLI_PATH` environment variable to the binary path.

4. Run the server:
   ```bash
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

The server will run on port 3001 by default.

## API Endpoints

### POST /api/analyze-voice
Analyzes mood from audio.

**Request:**
- Headers: `Authorization: Bearer <firebaseIdToken>`
- Body: `{ "audioBase64": "base64string", "uid": "userId" }`

**Response:**
- 200: `{ "id": "docId", "summary": "summary" }`
- 401: Unauthorized
- 503: CLI not available (use fallback)

### POST /api/generate-quiz
Generates mood quiz questions.

**Request:**
- Headers: `Authorization: Bearer <firebaseIdToken>`
- Body: `{ "uid": "userId" }`

**Response:**
- 200: `{ "quizId": "id", "questions": [...] }`

### POST /api/score-quiz
Scores quiz answers.

**Request:**
- Headers: `Authorization: Bearer <firebaseIdToken>`
- Body: `{ "uid": "userId", "quizId": "optional", "answers": [...] }`

**Response:**
- 200: `{ "id": "docId", "summary": "summary" }`

## Deployment to Cloud Run

1. Build the Docker image:
   ```bash
   docker build -t chillspace-backend .
   ```

2. Push to Google Container Registry:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT/chillspace-backend
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy chillspace-backend --image gcr.io/YOUR_PROJECT/chillspace-backend --platform managed --allow-unauthenticated
   ```

Ensure the service account has Firestore access.

## Fallback Handling

If Gemini CLI is not installed or fails, endpoints return 503 with `fallback: true`. The frontend should handle this by using local mock analysis.
