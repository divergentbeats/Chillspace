const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { runGeminiForAudio, runGeminiForText } = require('../lib/geminiCliWrapper');

const router = express.Router();

// Middleware to verify Firebase ID token
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Sanity check for moodScores
function validateMoodScores(moodScores) {
  if (!moodScores || typeof moodScores !== 'object') {
    throw new Error('Invalid moodScores format');
  }

  const requiredKeys = ['happy', 'calm', 'stressed', 'anxious'];
  for (const key of requiredKeys) {
    if (!(key in moodScores) || typeof moodScores[key] !== 'number') {
      throw new Error(`Missing or invalid ${key} in moodScores`);
    }
  }

  const total = Object.values(moodScores).reduce((sum, val) => sum + val, 0);
  if (total < 0.8 || total > 1.2) { // Allow some tolerance for floating point
    throw new Error('Mood scores sum is unreasonable');
  }

  return true;
}

// POST /api/analyze-voice
router.post('/analyze-voice', verifyToken, async (req, res) => {
  const { audioBase64, uid } = req.body;
  if (!audioBase64 || !uid) {
    return res.status(400).json({ error: 'Missing audioBase64 or uid' });
  }

  // Decode base64 to temp file
  const tempDir = process.env.TMPDIR || '/tmp';
  const tempFilePath = path.join(tempDir, `${uuidv4()}.wav`);
  try {
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    fs.writeFileSync(tempFilePath, audioBuffer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save temp audio' });
  }

  // Call Gemini CLI
  const prompt = 'Analyze the mood from this audio. Return JSON with percentages for emotions (happy, calm, stressed, anxious, sad, angry, hopeful), a one-line summary, and crisisDetected boolean.';
  const result = await runGeminiForAudio({ audioFilePath: tempFilePath, prompt });

  // Clean up temp file
  try {
    fs.unlinkSync(tempFilePath);
  } catch (e) {
    console.error('Failed to delete temp file:', e);
  }

  if (!result.ok) {
    if (result.error === 'CLI_NOT_INSTALLED') {
      return res.status(503).json({ error: 'Gemini CLI not available', fallback: true });
    }
    return res.status(500).json({ error: result.error });
  }

  // Validate moodScores
  try {
    validateMoodScores(result.data);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  // Save to Firestore
  const db = admin.firestore();
  const docRef = await db.collection('users').doc(uid).collection('moodLogs').add({
    userId: uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    source: 'voice',
    moodScores: result.data,
    summary: result.data.summary || 'Analysis complete',
    tagsDetected: result.data.tagsDetected || []
  });

  res.json({ id: docRef.id, summary: result.data.summary || 'Analysis complete' });
});

// POST /api/generate-quiz
router.post('/generate-quiz', verifyToken, async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'Missing uid' });
  }

  const prompt = 'Generate 3-5 short culturally sensitive mood quiz questions with 4 options each. Return only JSON array with question, options, and mapping to mood categories.';
  const result = await runGeminiForText({ prompt });

  if (!result.ok) {
    if (result.error === 'CLI_NOT_INSTALLED') {
      return res.status(503).json({ error: 'Gemini CLI not available', fallback: true });
    }
    return res.status(500).json({ error: result.error });
  }

  // Save to Firestore
  const db = admin.firestore();
  const quizId = uuidv4();
  await db.collection('generatedQuizzes').doc(quizId).set({
    userId: uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    quizJson: result.data
  });

  res.json({ quizId, questions: result.data });
});

// POST /api/score-quiz
router.post('/score-quiz', verifyToken, async (req, res) => {
  const { uid, answers } = req.body;
  if (!uid || !answers) {
    return res.status(400).json({ error: 'Missing uid or answers' });
  }

  const answersText = answers.map(a => `${a.question}: ${a.answer}`).join('\n');
  const prompt = `Score this quiz and return mood percentages + summary. Answers:\n${answersText}`;
  const result = await runGeminiForText({ prompt });

  if (!result.ok) {
    if (result.error === 'CLI_NOT_INSTALLED') {
      return res.status(503).json({ error: 'Gemini CLI not available', fallback: true });
    }
    return res.status(500).json({ error: result.error });
  }

  // Validate moodScores
  try {
    validateMoodScores(result.data);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  // Save to Firestore
  const db = admin.firestore();
  const docRef = await db.collection('users').doc(uid).collection('moodLogs').add({
    userId: uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    source: 'quiz',
    moodScores: result.data,
    summary: result.data.summary || 'Quiz scored',
    tagsDetected: result.data.tagsDetected || []
  });

  res.json({ id: docRef.id, summary: result.data.summary || 'Quiz scored' });
});

module.exports = router;
