const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://api.scrapingant.com/v2/general?url=https%3A%2F%2Freplit.com%2F%40shrqbabu%2FGemini-Hub&x-api-key=116130fb585c478bae87b2e22cfecadf&proxy_type=residential&proxy_country=IN';

const CHROMIUM_PATH = fs.existsSync('/opt/google/chrome/chrome')
  ? '/opt/google/chrome/chrome'
  : '/usr/bin/google-chrome';

const REPLIT_COOKIE = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Iktna0hjZyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9yZXBsaXQtd2ViIiwibmFtZSI6InNocnEgYmFidSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJNm0xcmtWQ0lfUFJidFdqMm14eVExV3FCQzAyWGltbFN3TEszMHVKcVRDbGtscHdcdTAwM2RzOTYtYyIsInJvbGVzIjpbXSwicmVwbGl0X3VzZXJfaWQiOjYyNDAzODM4LCJhdWQiOiJyZXBsaXQtd2ViIiwiYXV0aF90aW1lIjoxNzkwNDA3NTU1LCJ1c2VyX2lkIjoiTWZEWEpOaU80cU1Db3pXN29FeE5GbUdpWXV3MSIsInN1YiI6Ik1mRFhKTmlPNHFNQ296VzdvRXhORm1HaVl1dzEiLCJpYXQiOjE3OTA0MTg3ODYsImV4cCI6MTc5MTYyODM4NiwiZW1haWwiOiJzaHJxYmFidTVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMTM4MDQxNjQ0NzUzMzc5ODYxMTgiXSwiZW1haWwiOlsic2hycWJhYnU1QGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.R4k23nccjgrJAWKR4Uco7q2OrTM_gVVA-hrMJl0N9z_7ZMaVdZuc1KAEG7PDMSeA4LFI8WErUG3whML6cC3SUgD8pryZYP0I79ED7v_OCD3mt9khZl0Gh24bLLIc9oNI1_14s54O9nq2VC4MxtIA7bU7uqlKGKlJ0aw_1eeJpa15Aj_0HdImL15urxrBM3GsZjSYPypP5lRMJPmQz0EJJd_FX8od-3uNyJ_nY8ji40brivUmevi3e0hjBYdDRpUexHLYPCMOp-riYTCVz3Mjh0dCcw22TV8t2QZazJJUu_CWfERd004egBcJRxhg8Q5ic-n2utXxBr2LDxWmDpIIeQ';

// Profile Directory
const PROFILE_DIR = path.join(__dirname, 'profile');

if (!fs.existsSync(PROFILE_DIR)) {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
}

async function start() {
  console.log('====================================================');
  console.log('          VPS REPLIT RUNNER                         ');
  console.log('====================================================');
  console.log('Target URL :', TARGET_URL);
  console.log('Browser    :', CHROMIUM_PATH);
  console.log('Profile Dir:', PROFILE_DIR);
  console.log('Proxy      : Disabled');
  console.log('Status     : Starting browser...\n');

  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--renderer-process-limit=1',
    '--disable-site-isolation-trials',
    '--disable-extensions',
    '--disable-default-apps',
    '--disable-sync'
  ];

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: 'new',
    userDataDir: PROFILE_DIR,
    defaultViewport: {
      width: 1280,
      height: 720
    },
    args: launchArgs
  });

  const page = await browser.newPage();

  // Optional Replit cookie
  if (REPLIT_COOKIE) {
    const cookiesToSet = [
      {
        name: 'connect.sid',
        value: REPLIT_COOKIE,
        domain: '.replit.com',
        path: '/'
      },
      {
        name: 'replit:authtoken',
        value: REPLIT_COOKIE,
        domain: '.replit.com',
        path: '/'
      }
    ];

    for (const cookie of cookiesToSet) {
      await page.setCookie(cookie).catch(() => {});
    }
  }

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/130.0.0.0 Safari/537.36'
  );

  console.log('Navigating to Replit Workspace...');

  await page.goto(TARGET_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  }).catch(error => {
    console.log('Navigation:', error.message);
  });

  console.log(
    'Monitoring Replit Workspace and clicking Run button...\n'
  );

  let clickedSuccess = false;

  // Maximum 15 attempts
  for (let attempt = 1; attempt <= 15; attempt++) {
    console.log(
      `[${new Date().toLocaleTimeString()}] ` +
      `Checking Run button (${attempt}/15)...`
    );

    const clicked = await page.evaluate(() => {
      const target =
        document.querySelector('[action="run_button_used"]') ||
        document.querySelector('[data-action="run_button_used"]') ||
        document.querySelector('[data-analytics*="run_button_used"]') ||
        document.querySelector('button[aria-label*="Run"]');

      if (target) {
        target.click();

        return {
          success: true,
          text: 'Action Target'
        };
      }

      const allElements = Array.from(
        document.querySelectorAll(
          'button, div[role="button"], a, span'
        )
      );

      for (const el of allElements) {
        const text = (
          el.innerText ||
          el.textContent ||
          ''
        ).trim();

        if (
          text.includes('Run .replit run command') ||
          text === 'Run' ||
          text === '▶ Run' ||
          el.getAttribute('action') === 'run_button_used'
        ) {
          const btn = el.closest('button') || el;

          btn.click();

          return {
            success: true,
            text
          };
        }
      }

      return {
        success: false
      };
    });

    if (clicked && clicked.success) {
      console.log(
        `[${new Date().toLocaleTimeString()}] ` +
        `🚀 SUCCESS: Clicked Run Button (${clicked.text})!`
      );

      clickedSuccess = true;

      console.log(
        'Waiting 25s for container to boot up...'
      );

      await new Promise(resolve =>
        setTimeout(resolve, 25000)
      );

      break;
    }

    await new Promise(resolve =>
      setTimeout(resolve, 8000)
    );
  }

  await browser.close();

  if (clickedSuccess) {
    console.log(
      '✅ Workflow job finished successfully.'
    );

    console.log(
      'Profile cached for next run!'
    );

    process.exit(0);
  }

  console.warn(
    '⚠️ Warning: Run button was not detected within timeout.'
  );

  process.exit(0);
}

start().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
