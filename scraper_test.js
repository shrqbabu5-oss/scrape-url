const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ================= CONFIGURATION =================

const TARGET_URL = process.env.TARGET_URL || 'https://replit.com/@shrqbabu/Gemini-Hub';

const REPLIT_COOKIE = process.env.REPLIT_COOKIE;

const ZENROWS_API_KEY = (process.env.ZENROWS_API_KEY || '').trim();
const CUSTOM_PROXY = (process.env.PROXY_URL || process.env.PROXY_SERVER || '').trim();

// Setup Proxy Configuration
function getProxyConfig() {
  if (ZENROWS_API_KEY) {
    console.log('🛡️ Proxy: ZenRows Residential Proxy configured (via ZENROWS_API_KEY secret)');
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
      console.log('⚠️ Cloudflare Challenge detected! Finding checkbox...');
      const frames = page.frames();
      for (const frame of frames) {
        const checkbox = await frame.$('input[type="checkbox"], .ctp-checkbox-label, #challenge-stage, .mark').catch(() => null);
        if (checkbox) {
          console.log('👉 Found Turnstile checkbox! Clicking...');
          await checkbox.click().catch(() => {});
          await new Promise(r => setTimeout(r, 4000));
          return;
        }
      }

      const turnstile = await page.$('iframe[src*="cloudflare"], #turnstile-wrapper');
      if (turnstile) {
        const box = await turnstile.boundingBox();
        if (box) {
          console.log(`👉 Clicking Turnstile at (${box.x + 30}, ${box.y + box.height / 2})...`);
          await page.mouse.click(box.x + 30, box.y + box.height / 2);
          await new Promise(r => setTimeout(r, 4000));
        }
      }
    }
  } catch (_) {}
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
    '--window-size=1280,720'
  ];

  if (proxyConfig.server) {
    launchArgs.push(`--proxy-server=${proxyConfig.server}`);
  }

  const launchOptions = {
    headless: isXvfb ? false : 'new',
    userDataDir: PROFILE_DIR,
    defaultViewport: { width: 1280, height: 720 },
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
  const maxAttempts = 15;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await solveCloudflare(page);

    const clicked = await page.evaluate(() => {
      const target = document.querySelector('[action="run_button_used"]') ||
                     document.querySelector('[data-action="run_button_used"]') ||
                     document.querySelector('[data-analytics*="run_button_used"]') ||
                     document.querySelector('button[aria-label*="Run"]');
      if (target) {
        target.click();
        return { success: true, text: 'Action Target' };
      }

      const container = document.querySelector('button:has([action="run_button_used"])');
      if (container) {
        container.click();
        return { success: true, text: 'Container Target' };
      }

      const allElements = Array.from(document.querySelectorAll('button, div[role="button"], a, span'));
      for (const el of allElements) {
        const text = (el.innerText || el.textContent || '').trim();
        if (text.includes('Run .replit run command') || text === 'Run' || text === '▶ Run' || el.getAttribute('action') === 'run_button_used') {
          const btn = el.closest('button') || el;
          btn.click();
          return { success: true, text: text };
        }
      }

      return { success: false };
    });

    if (clicked && clicked.success) {
      console.log(`[Attempt ${attempt}] 🚀 SUCCESS: Clicked Run Button (${clicked.text})!`);
      clickedSuccess = true;
      console.log('Keeping container alive for 30s to ensure startup...');
      await new Promise(r => setTimeout(r, 30000));
      break;
    }

    await new Promise(r => setTimeout(r, 8000));
  }

  await browser.close();

  if (clickedSuccess) {
    console.log('✅ Workflow job finished successfully. Replit is RUNNING!');
    process.exit(0);
  } else {
    console.warn('⚠️ Warning: Run button not detected within timeout. Profile saved.');
    process.exit(0);
  }
}

start().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
