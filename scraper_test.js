const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ================= CONFIGURATION =================

const TARGET_URL = process.env.TARGET_URL || 'https://replit.com/@shrqbabu/Gemini-Hub';

const REPLIT_COOKIE = process.env.REPLIT_COOKIE || 'eyJhbGciOiJSG3whML6cC3SUgD8pryZYP0I79ED7v_OCD3mt9khZl0Gh24bLLIc9oNI1_14s54O9nq2VC4MxtIA7bU7uqlKGKlJ0aw_1eeLYPCMOp-riYTCVz3Mjh0dCcw22TV8t2QZazJJUu_CWfERd004egBcJRxhg8Q5ic-n2utXxBr2LDxWmDpIIeQ';

const ZENROWS_API_KEY = (process.env.ZENROWS_API_KEY || '').trim();
const CUSTOM_PROXY = (process.env.PROXY_URL || process.env.PROXY_SERVER || '').trim();

// Setup Proxy Configuration
function getProxyConfig() {
  if (ZENROWS_API_KEY) {
    console.log('🛡️ Proxy: ZenRows Residential Proxy configured (via ZENROWS_API_KEY)');
    return {
      server: 'http://proxy.zenrows.com:8001',
      username: ZENROWS_API_KEY,
      password: ''
    };
  }

  if (CUSTOM_PROXY) {
    try {
      let p = CUSTOM_PROXY;
      if (!p.includes('://')) p = 'http://' + p;
      const parsed = new URL(p);
      return {
        server: `${parsed.protocol}//${parsed.host}`,
        username: parsed.username ? decodeURIComponent(parsed.username) : (process.env.PROXY_USERNAME || ''),
        password: parsed.password ? decodeURIComponent(parsed.password) : (process.env.PROXY_PASSWORD || '')
      };
    } catch (_) {
      return { server: CUSTOM_PROXY, username: '', password: '' };
    }
  }

  return { server: null, username: null, password: null };
}

// Persistent Chrome Profile Directory
const PROFILE_DIR = path.join(__dirname, 'profile');
if (!fs.existsSync(PROFILE_DIR)) {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
}

// Auto-detect Chromium / Google Chrome
function getChromiumPath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const paths = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

// Auto-solve Cloudflare Turnstile if present
async function solveCloudflare(page) {
  try {
    const title = await page.title().catch(() => '');
    if (title.includes('Just a moment') || title.includes('Attention Required')) {
      console.log(`⚠️ Cloudflare Challenge detected ("${title}")! Finding checkbox...`);
      const frames = page.frames();
      for (const frame of frames) {
        const checkbox = await frame.$('input[type="checkbox"], .ctp-checkbox-label, #challenge-stage, .mark').catch(() => null);
        if (checkbox) {
          console.log('👉 Found Turnstile checkbox in frame! Clicking...');
          await checkbox.click().catch(() => {});
          await new Promise(r => setTimeout(r, 4000));
          return true;
        }
      }

      const turnstile = await page.$('iframe[src*="cloudflare"], #turnstile-wrapper');
      if (turnstile) {
        const box = await turnstile.boundingBox();
        if (box) {
          console.log(`👉 Clicking Turnstile at (${box.x + 30}, ${box.y + box.height / 2})...`);
          await page.mouse.click(box.x + 30, box.y + box.height / 2);
          await new Promise(r => setTimeout(r, 4000));
          return true;
        }
      }
    }
  } catch (_) {}
  return false;
}

async function start() {
  console.log('====================================================');
  console.log('   REPLIT AUTO RUNNER (ZENROWS PROXY & PROFILE)     ');
  console.log('====================================================');
  console.log('Target URL : ', TARGET_URL);
  console.log('Profile Dir: ', PROFILE_DIR);
  const chromiumPath = getChromiumPath();
  console.log('Browser    : ', chromiumPath || 'Bundled Chromium');

  const proxyConfig = getProxyConfig();

  const isXvfb = Boolean(process.env.DISPLAY);
  console.log('Display    : ', isXvfb ? `Xvfb (${process.env.DISPLAY})` : 'Headless');

  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-blink-features=AutomationControlled',
    '--disable-extensions',
    '--disable-default-apps',
    '--mute-audio',
    '--window-size=1920,1080'
  ];

  if (proxyConfig.server) {
    launchArgs.push(`--proxy-server=${proxyConfig.server}`);
  }

  const launchOptions = {
    headless: isXvfb ? false : 'new',
    userDataDir: PROFILE_DIR,
    defaultViewport: { width: 1920, height: 1080 },
    args: launchArgs
  };

  if (chromiumPath) {
    launchOptions.executablePath = chromiumPath;
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = (await browser.pages())[0] || await browser.newPage();

  // Proxy Authentication
  if (proxyConfig.username) {
    await page.authenticate({
      username: proxyConfig.username,
      password: proxyConfig.password || ''
    });
  }

  // Set Auth Cookies
  if (REPLIT_COOKIE) {
    const cookiesToSet = [
      { name: 'connect.sid', value: REPLIT_COOKIE, domain: '.replit.com', path: '/' },
      { name: 'replit:authtoken', value: REPLIT_COOKIE, domain: '.replit.com', path: '/' }
    ];
    for (const c of cookiesToSet) {
      await page.setCookie(c).catch(() => {});
    }
  }

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');

  console.log('Navigating to Replit Workspace...');
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => console.log('Goto notice:', e.message));

  console.log('Monitoring Replit Workspace and clicking Run button...\n');

  let clickedSuccess = false;
  const maxAttempts = 18; // Poll for ~2.5 minutes

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isChallenge = await solveCloudflare(page);
    const currentUrl = page.url();
    const currentTitle = await page.title().catch(() => '');

    console.log(`[Attempt ${attempt}/${maxAttempts}] Title: "${currentTitle}" | URL: ${currentUrl}`);

    if (isChallenge) {
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }

    // 1. Try Universal Keyboard Shortcut (Ctrl+Enter is Replit's Run Shortcut)
    try {
      await page.keyboard.down('Control');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Control');
    } catch (_) {}

    // 2. Comprehensive DOM Element Search for Run / Open buttons
    const clicked = await page.evaluate(() => {
      // Priority 1: Exact Action attribute buttons
      const directActions = [
        '[action="run_button_used"]',
        '[data-action="run_button_used"]',
        '[data-analytics*="run_button_used"]',
        '[data-cy="run-button"]',
        '[data-testid="run-button"]',
        'button[aria-label*="Run"]',
        'button[aria-label*="run"]',
        'button[title*="Run"]'
      ];

      for (const sel of directActions) {
        const el = document.querySelector(sel);
        if (el) {
          el.click();
          return { success: true, text: sel };
        }
      }

      // Priority 2: "Open in Workspace" or "Fork" if on Cover page
      const openBtn = Array.from(document.querySelectorAll('button, a')).find(el => {
        const t = (el.innerText || '').trim();
        return t.includes('Open in Workspace') || t.includes('Fork') || t.includes('Edit in Workspace');
      });
      if (openBtn) {
        openBtn.click();
        return { success: true, text: 'Open in Workspace / Fork' };
      }

      // Priority 3: Search all button and span text
      const allElements = Array.from(document.querySelectorAll('button, div[role="button"], a, span'));
      for (const el of allElements) {
        const text = (el.innerText || el.textContent || '').trim();
        if (text === 'Run' || text === '▶ Run' || text === 'Run Repl' || text.startsWith('Run ') || text.includes('run command')) {
          const btn = el.closest('button') || el;
          btn.click();
          return { success: true, text: text };
        }
      }

      // Collect visible buttons for debugging
      const visibleButtons = Array.from(document.querySelectorAll('button'))
        .map(b => (b.innerText || b.getAttribute('aria-label') || '').trim())
        .filter(Boolean)
        .slice(0, 8);

      return { success: false, visibleButtons };
    });

    if (clicked && clicked.success) {
      console.log(`\n🚀 [SUCCESS]: Clicked Button -> "${clicked.text}"!`);
      clickedSuccess = true;
      console.log('Keeping container alive for 30s to ensure startup...');
      await new Promise(r => setTimeout(r, 30000));
      break;
    } else if (clicked && clicked.visibleButtons && clicked.visibleButtons.length > 0) {
      console.log(`   ℹ️ [Visible Buttons]: [${clicked.visibleButtons.join(', ')}]`);
    }

    await new Promise(r => setTimeout(r, 8000));
  }

  await browser.close();

  if (clickedSuccess) {
    console.log('\n✅ Workflow job finished successfully. Replit is RUNNING!');
    process.exit(0);
  } else {
    console.warn('\n⚠️ Warning: Run button not detected within timeout. Profile saved.');
    process.exit(0);
  }
}

start().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
