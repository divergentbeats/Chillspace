const { spawn } = require('child_process');
const path = require('path');

function parseJsonOutput(output) {
  try {
    return JSON.parse(output);
  } catch (e) {
    // Try to extract JSON block using regex
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

function runCommand(command, args, timeoutMs) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { shell: true });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      proc.kill();
      resolve({ ok: false, error: 'Timeout', stderr });
    }, timeoutMs);

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      if (err.code === 'ENOENT') {
        resolve({ ok: false, error: 'CLI_NOT_INSTALLED', stderr });
      } else {
        resolve({ ok: false, error: err.message, stderr });
      }
    });

    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (timedOut) return;
      if (code !== 0) {
        resolve({ ok: false, error: `Process exited with code ${code}`, stderr });
        return;
      }
      const parsed = parseJsonOutput(stdout);
      if (parsed) {
        resolve({ ok: true, data: parsed });
      } else {
        resolve({ ok: false, error: 'Invalid JSON output', stderr });
      }
    });
  });
}

async function runGeminiForAudio({ audioFilePath, prompt, timeoutMs = 60000 }) {
  const geminiCmd = process.env.GEMINI_CLI_PATH || 'gemini';
  const args = [
    'generate',
    '--model=gemini-1.5-pro',
    `--input-file=${audioFilePath}`,
    `--prompt=${prompt}`,
    '--output-format=json'
  ];
  console.debug('Running Gemini CLI for audio with args:', args);
  return runCommand(geminiCmd, args, timeoutMs);
}

async function runGeminiForText({ prompt, timeoutMs = 30000 }) {
  const geminiCmd = process.env.GEMINI_CLI_PATH || 'gemini';
  const args = [
    'generate',
    '--model=gemini-1.5-pro',
    `--prompt=${prompt}`,
    '--output-format=json'
  ];
  console.debug('Running Gemini CLI for text with args:', args);
  return runCommand(geminiCmd, args, timeoutMs);
}

function mockAnalyze() {
  return Promise.resolve({
    ok: true,
    data: {
      mood: 'Happy',
      confidence: 0.9,
      emotions: {
        happiness: 90,
        anxiety: 5,
        calm: 80,
        energy: 70,
        motivation: 75
      }
    }
  });
}

module.exports = {
  runGeminiForAudio,
  runGeminiForText,
  mockAnalyze
};
