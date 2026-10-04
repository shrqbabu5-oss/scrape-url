const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const TARGET_URL = 'https://replit.com/@shrqbabu/Gemini-Hub';

const CHROMIUM_PATH = fs.existsSync('/opt/google/chrome/chrome')
  ? '/opt/google/chrome/chrome'
  : '/usr/bin/google-chrome';

const REPLIT_COOKIE = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Iktna0hjZyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9yZXBsaXQtd2ViIiwibmFtZSI6InNocnEgYmFidSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJNm0xcmtWQ0lfUFJidFdqMm14eVExV3FCQzAyWGltbFN3TEszMHVKcVRDbGtscHdcdTAwM2RzOTYtYyIsInJvbGVzIjpbXSwicmVwbGl0X3VzZXJfaWQiOjYyNDAzODM4LCJhdWQiOiJyZXBsaXQtd2ViIiwiYXV0aF90aW1lIjoxNzkwNDA3NTU1LCJ1c2VyX2lkIjoiTWZEWEpOaU80cU1Db3pXN29FeE5GbUdpWXV3MSIsInN1YiI6Ik1mRFhKTmlPNHFNQ296VzdvRXhORm1HaVl1dzEiLCJpYXQiOjE3OTA0MTg3ODYsImV4cCI6MTc5MTYyODM4NiwiZW1haWwiOiJzaHJxYmFidTVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMTM4MDQxNjQ0NzUzMzc5ODYxMTgiXSwiZW1haWwiOlsic2hycWJhYnU1QGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.R4k23nccjgrJAWKR4Uco7q2OrTM_gVVA-hrMJl0N9z_7ZMaVdZuc1KAEG7PDMSeA4LFI8WErUG3whML6cC3SUgD8pryZYP0I79ED7v_OCD3mt9khZl0Gh24bLLIc9oNI1_14s54O9nq2VC4MxtIA7bU7uqlKGKlJ0aw_1eeJpa15Aj_0HdImL15urxrBM3GsZjSYPypP5lRMJPmQz0EJJd_FX8od-3uNyJ_nY8ji40brivUmevi3e0hjBYdDRpUexHLYPCMOp-riYTCVz3Mjh0dCcw22TV8t2QZazJJUu_CWfERd004egBcJRxhg8Q5ic-n2utXxBr2LDxWmDpIIeQ';

// 1. Profile Directory (Save Profile)
const PROFILE_DIR = path.join(__dirname, 'profile');
if (!fs.existsSync(PROFILE_DIR)) {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
}

// 2. Webshare / Custom Proxy
const PROXY_URL = 'http://shrqbabu-rotate:shariq98083@p.webshare.io:80';

function getProxyConfig() {
  if (!PROXY_URL) return null;
  try {
    let p = PROXY_URL;
    if (!p.includes('://')) p = 'http://' + p;
    const parsed = new URL(p);
    return {
      server: `${parsed.protocol}//${parsed.host}`,
      username: parsed.username ? decodeURIComponent(parsed.username) : null,
      password: parsed.password ? decodeURIComponent(parsed.password) : null
    };
  } catch (_) {
    return { server: PROXY_URL, username: null, password: null };
  }
}

async function start() {
  console.log('====================================================');
  console.log('   VPS REPLIT RUNNER (AUTO CLOUDFLARE SOLVER)       ');
  console.log('====================================================');
  console.log('Target URL : ', TARGET_URL);
  console.log('Browser    : ', CHROMIUM_PATH);
  console.log('Profile Dir: ', PROFILE_DIR);

  const proxyConfig = getProxyConfig();
  if (proxyConfig && proxyConfig.server) {
    console.log('Proxy      : ', proxyConfig.server, `(Auth: ${proxyConfig.username ? 'Yes' : 'No'})`);
  } else {
    console.log('Proxy      :  Direct Connection');
  }

  console.log('Status     : Starting browser...\n');

  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-blink-features=AutomationControlled',
    '--disable-extensions',
    '--disable-default-apps',
    '--disable-sync',
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-spki-list',
    '--allow-running-insecure-content',
    '--window-size=1280,720'
  ];

  if (proxyConfig && proxyConfig.server) {
    launchArgs.push(`--proxy-server=${proxyConfig.server}`);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: 'new',
    ignoreHTTPSErrors: true,
    userDataDir: PROFILE_DIR,
    defaultViewport: { width: 1280, height: 720 },
    args: launchArgs
  });

  const page = await browser.newPage();

  if (proxyConfig && proxyConfig.username) {
    await page.authenticate({
      username: proxyConfig.username,
      password: proxyConfig.password || ''
    });
  }

  // ⚡ Smart Data Saver (Do NOT block Cloudflare Turnstile assets)
  await page.setRequestInterception(true);
  page.on('request', req => {
    const type = req.resourceType();
    const u = req.url().toLowerCase();

    // Never block Cloudflare security requests
    if (u.includes('cloudflare') || u.includes('turnstile') || u.includes('challenges.')) {
      return req.continue();
    }

    if (type === 'media' || u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.m3u8') || u.endsWith('.ts')) {
      return req.abort();
    }

    req.continue();
  });

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

  // Auto-solve Cloudflare Turnstile
  async function solveCloudflare() {
    try {
      const title = await page.title().catch(() => '');
      if (title.includes('Just a moment') || title.includes('Attention Required')) {
        console.log('⚠️ Cloudflare Challenge detected! Finding Turnstile widget...');

        // 1. Search all frames for interactive checkbox
        const frames = page.frames();
        for (const frame of frames) {
          const checkbox = await frame.$('input[type="checkbox"], .ctp-checkbox-label, #challenge-stage, .mark, label').catch(() => null);
          if (checkbox) {
            console.log('👉 Found Turnstile element in frame! Clicking...');
            await checkbox.click().catch(() => {});
            await new Promise(r => setTimeout(r, 4000));
            return;
          }
        }

        // 2. Physical mouse click on Turnstile iframe container
        const turnstile = await page.$('iframe[src*="cloudflare"], iframe[src*="turnstile"], #turnstile-wrapper');
        if (turnstile) {
          const box = await turnstile.boundingBox();
          if (box) {
            console.log(`👉 Physical Click at (${box.x + 35}, ${box.y + box.height / 2})...`);
            await page.mouse.click(box.x + 35, box.y + box.height / 2);
            await new Promise(r => setTimeout(r, 4000));
          }
        }
      }
    } catch (_) {}
  }

  await solveCloudflare();

  console.log('Monitoring Replit Workspace and clicking Run button...\n');

  let clickedSuccess = false;

  for (let attempt = 1; attempt <= 15; attempt++) {
    await solveCloudflare();

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
      console.log(`[${new Date().toLocaleTimeString()}] 🚀 SUCCESS: Clicked Run Button (${clicked.text})!`);
      clickedSuccess = true;
      console.log('Waiting 25s for container to boot up...');
      await new Promise(r => setTimeout(r, 25000));
      break;
    }

    await new Promise(r => setTimeout(r, 8000));
  }

  await browser.close();

  if (clickedSuccess) {
    console.log('✅ Workflow job finished successfully. Profile cached for next run!');
    process.exit(0);
  } else {
    console.warn('⚠️ Warning: Run button not detected within timeout.');
    process.exit(0);
  }
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
