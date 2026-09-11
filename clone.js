#!/usr/bin/env node

/**
 * CLI Runner for Landing Page Cloner Engine
 * Usage: node clone.js <url> <project_name> [cta_url]
 * Or run directly for interactive mode: node clone.js
 */

const readline = require('readline');
const { cloneLandingPage } = require('./engine/cloner');

function printBanner() {
  console.log('\\x1b[1m\\x1b[33m');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       ⚡ LANDING PAGE CLONER ENGINE FOR SCALEV ⚡            ║');
  console.log('║               Light Neo-Brutalism Edition                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\\x1b[0m');
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  printBanner();

  let [,, urlArg, nameArg, ctaArg, modeArg] = process.argv;

  let targetUrl = urlArg;
  let projectName = nameArg;
  let ctaUrl = ctaArg;
  let mode = modeArg || (process.argv.includes('--fast') ? 'fast' : 'puppeteer');

  // If arguments not provided, run interactively
  if (!targetUrl) {
    console.log('\x1b[36m[Interactive Mode]\x1b[0m Please provide the following details:\n');
    targetUrl = await prompt('📌 Target Landing Page URL to clone: ');
    
    if (!projectName) {
      projectName = await prompt('📁 Project Name / Folder (e.g. ShoeStore / TDW_Seminar): ');
    }

    if (!ctaUrl) {
      const customCta = await prompt('🔗 Scalev Checkout Link Placeholder [Press Enter for default]: ');
      if (customCta) ctaUrl = customCta;
    }

    const chosenMode = await prompt('🚀 Engine Mode (1 = Dynamic Puppeteer [Next/React/Astro], 2 = Fast Static [HTTP]) [Default: 1]: ');
    if (chosenMode === '2' || chosenMode.toLowerCase() === 'fast') {
      mode = 'fast';
    } else {
      mode = 'puppeteer';
    }
  }

  if (!targetUrl) {
    console.error('\x1b[31mError: URL cannot be empty!\x1b[0m');
    process.exit(1);
  }

  if (!projectName) {
    console.error('\x1b[31mError: Project name cannot be empty!\x1b[0m');
    process.exit(1);
  }

  console.log('\n--------------------------------------------------------------');
  
  try {
    const result = await cloneLandingPage({
      url: targetUrl,
      projectName: projectName,
      ctaUrl: ctaUrl,
      mode: mode,
      onLog: (msg, type) => {
        if (type === 'step') {
          console.log(`\x1b[34m[STEP]\x1b[0m ${msg}`);
        } else if (type === 'success') {
          console.log(`\x1b[32m[OK]\x1b[0m ${msg}`);
        } else if (type === 'finish') {
          console.log(`\n\x1b[1m\x1b[32m🎉 ${msg}\x1b[0m`);
        } else {
          console.log(`[INFO] ${msg}`);
        }
      }
    });

    console.log('--------------------------------------------------------------');
    console.log(`📂 Project Folder : projects/${result.projectName}`);
    console.log(`📄 Standalone File: ${result.indexFile}`);
    console.log(`📝 Scalev Guide   : projects/${result.projectName}/SCALEV_GUIDE.md`);
    console.log('--------------------------------------------------------------\n');
    process.exit(0);

  } catch (err) {
    console.error('\n\x1b[31m[ERROR FAILED]:\x1b[0m', err.message);
    process.exit(1);
  }
}

main();
