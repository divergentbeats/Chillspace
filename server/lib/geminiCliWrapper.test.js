const { runGeminiForAudio, runGeminiForText, mockAnalyze } = require('./geminiCliWrapper');

async function testRunGeminiForText() {
  console.log('Testing runGeminiForText...');
  const result = await runGeminiForText({
    prompt: 'Analyze the mood from this text: I feel happy today.',
    timeoutMs: 10000
  });
  console.log('Result:', result);
}

async function testRunGeminiForAudio() {
  console.log('Testing runGeminiForAudio...');
  const result = await runGeminiForAudio({
    audioFilePath: 'test-sample.wav', // Mocked path
    prompt: 'Transcribe and analyze the mood from this audio.',
    timeoutMs: 20000
  });
  console.log('Result:', result);
}

async function testMockAnalyze() {
  console.log('Testing mockAnalyze...');
  const result = await mockAnalyze();
  console.log('Result:', result);
}

// Run tests
(async () => {
  await testMockAnalyze();
  await testRunGeminiForText();
  await testRunGeminiForAudio();
})();
