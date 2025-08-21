#!/usr/bin/env node
/**
 * Auto-start Python scraper when needed
 * Add this to your package.json scripts
 */

const { spawn } = require('child_process');
const fetch = require('node-fetch');

let pythonProcess = null;

async function checkScraperHealth() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    return response.ok;
  } catch {
    return false;
  }
}

async function startPythonScraper() {
  if (pythonProcess) {
    console.log('🐍 Python scraper already running');
    return;
  }

  console.log('🚀 Starting Python scraper...');
  
  pythonProcess = spawn('python3', ['scraping_api.py'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  pythonProcess.on('close', (code) => {
    console.log(`🐍 Python scraper exited with code ${code}`);
    pythonProcess = null;
  });

  // Wait for server to start
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (await checkScraperHealth()) {
      console.log('✅ Python scraper is ready!');
      return;
    }
  }
  
  throw new Error('Failed to start Python scraper');
}

async function ensureScraperRunning() {
  const isRunning = await checkScraperHealth();
  if (!isRunning) {
    await startPythonScraper();
  }
}

// Export for use in your app
module.exports = { ensureScraperRunning, startPythonScraper };

// Auto-start if run directly
if (require.main === module) {
  startPythonScraper().catch(console.error);
}