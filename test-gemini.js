// Test script to verify Gemini AI integration
// Run this in browser console on the mood analyzer page

const testGeminiConnection = async () => {
  console.log('🧪 Testing Gemini AI Connection...');

  try {
    // Test text analysis
    console.log('📝 Testing text analysis...');
    const testText = "I'm feeling really happy and excited today!";

    const response = await fetch('/.netlify/functions/geminiProxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Analyze this text for mood and sentiment. Respond ONLY with valid JSON in this exact format: {"moodScores": {"happy": 25, "calm": 30, "stressed": 15, "anxious": 10, "sad": 5, "angry": 5, "hopeful": 10}, "summary": "One-line summary here", "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]}. Ensure moodScores values are numbers that add up to 100.`,
        inputType: 'text',
        inputData: testText,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Text analysis successful:', data);

    // Test quiz analysis
    console.log('📊 Testing quiz analysis...');
    const testQuizAnswers = {
      1: "Very Happy",
      2: "Very High",
      3: "Excellent",
      4: "Very Motivated",
      5: "Very Low"
    };

    const quizResponse = await fetch('/.netlify/functions/geminiProxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Based on these quiz answers: ${JSON.stringify(testQuizAnswers)}, provide mood analysis. Respond ONLY with valid JSON in this exact format: {"moodScores": {"happy": 25, "calm": 30, "stressed": 15, "anxious": 10, "sad": 5, "angry": 5, "hopeful": 10}, "summary": "One-line summary here", "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]}. Ensure moodScores values are numbers that add up to 100.`,
        inputType: 'quiz',
        inputData: testQuizAnswers,
      }),
    });

    if (!quizResponse.ok) {
      throw new Error(`HTTP error! status: ${quizResponse.status}`);
    }

    const quizData = await quizResponse.json();
    console.log('✅ Quiz analysis successful:', quizData);

    console.log('🎉 All tests passed! Gemini AI is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('🔧 Troubleshooting tips:');
    console.log('1. Check if GEMINI_API_KEY is set in your environment variables');
    console.log('2. Verify your API key is valid and has quota');
    console.log('3. Check browser console for detailed error messages');
    console.log('4. Make sure you\'re running on a server that supports serverless functions');
  }
};

// Run the test
testGeminiConnection();
