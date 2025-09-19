# Gemini CLI Integration for Chillspace Backend

## Overview
This document describes how to set up, run, and test the Chillspace backend API that integrates with the Gemini CLI for mood analysis and quiz generation.

## Prerequisites
- Gemini CLI installed and authenticated on the server or local machine.
- Node.js and npm installed.
- Firebase project configured with service account credentials or environment variables.

## Environment Variables
- `GEMINI_CLI_PATH` (optional): Path to the Gemini CLI binary if not in system PATH.
- `NODE_ENV`: Set to `development` or `production`.
- `FIREBASE_PROJECT_ID` or `GOOGLE_APPLICATION_CREDENTIALS`: For Firebase Admin SDK authentication.

## Running the Backend Server

### Development Mode
```bash
npm run dev:server
```
This starts the Express server with nodemon for hot reloads.

### Production Mode
```bash
npm start
```

## Testing the Gemini CLI Wrapper

A small test script is provided to verify the Gemini CLI integration using a sample audio file.

### Usage
```bash
node server/lib/geminiCliWrapper.test.js path/to/sample.wav
```

This script will:
- Run the Gemini CLI on the provided audio file.
- Log the output JSON with mood analysis or errors.

## Deployment Notes
- The backend is designed to run on a server or VM where the Gemini CLI can be installed.
- Serverless functions may not support installing the Gemini binary.
- Consider using Google Cloud Run or similar containerized environments.

## Monitoring and Logging
- Errors and important events are logged to the console.
- For production, integrate with Stackdriver / Cloud Logging or other monitoring tools.

## Additional Notes
- Ensure the Firebase service account has appropriate permissions for Firestore.
- Validate environment variables before starting the server.
- Keep the Gemini CLI updated for best results.

## Contact
For issues or questions, contact the Chillspace development team.
