# Firestore Schema for Chillspace Mood Analysis

## Collections and Document Structures

### 1. moodLogs (Subcollection under users/{userId})

Documents represent individual mood analysis entries from voice or quiz sources.

Example document structure:
```json
{
  "userId": "user123",
  "createdAt": "serverTimestamp()",
  "source": "voice", // or "quiz"
  "moodScores": {
    "happy": 0.2,
    "calm": 0.3,
    "stressed": 0.1,
    "anxious": 0.1,
    "sad": 0.05,
    "angry": 0.05,
    "hopeful": 0.2
  },
  "summary": "User seems calm and hopeful with low stress.",
  "tagsDetected": ["calm", "hopeful"],
  "crisisDetected": false, // optional, for voice source
  "quizId": "optional-quiz-document-id", // only for quiz source
  "answers": [ // only for quiz source
    {"question": "How motivated are you?", "answer": "Very Motivated"},
    ...
  ]
}
```

### 2. generatedQuizzes (Subcollection under users/{userId})

Documents represent quizzes generated for the user.

Example document structure:
```json
{
  "questions": [
    {
      "question": "How motivated do you feel today?",
      "options": ["Very Motivated", "Motivated", "Neutral", "Unmotivated"]
    },
    ...
  ],
  "createdAt": "serverTimestamp()"
}
```

### 3. progressLogs (Top-level collection)

Documents represent daily progress logs for users.

Example document structure:
```json
{
  "userId": "user123",
  "date": "2024-06-01",
  "tasksCompleted": 5,
  "habitsDone": 3,
  "overallMoodSummary": "Feeling productive and calm",
  "aiSummary": "AI detected positive mood trends"
}
```

## Notes

- All timestamps use Firestore serverTimestamp() for consistency.
- moodScores should be validated to ensure keys exist and values sum approximately to 1.
- Firestore security rules should restrict writes to authenticated server identities or users owning the documents.
- The `tagsDetected` array contains mood tags extracted from analysis.
- The `crisisDetected` boolean flags urgent mood concerns (voice analysis).
- Quiz answers are stored with the moodLogs entry for quiz source.

## Security Rules (Example snippet)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/moodLogs/{docId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /users/{userId}/generatedQuizzes/{quizId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /progressLogs/{docId} {
      allow read, write: if request.auth.uid != null;
    }
  }
}
```

This schema document should be shared with developers to ensure consistent Firestore usage and data integrity.
