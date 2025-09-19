const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Mock mood analysis function
 * @param {string} text
 * @returns {string} mood category
 */
function analyzeMoodText(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('good')) {
    return 'Positive';
  } else if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('unhappy')) {
    return 'Negative';
  } else if (lowerText.includes('anxious') || lowerText.includes('nervous') || lowerText.includes('worried')) {
    return 'Anxious';
  }
  return 'Neutral';
}

exports.analyzeMood = functions.https.onCall(async (data, context) => {
  const { userId, text } = data;

  if (!userId || !text) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing userId or text');
  }

  const mood = analyzeMoodText(text);

  const moodRecord = {
    text,
    mood,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection('users').doc(userId).collection('moodHistory').add(moodRecord);
    return { success: true, mood };
  } catch (error) {
    console.error('Error saving mood record:', error);
    throw new functions.https.HttpsError('internal', 'Failed to save mood record');
  }
});
