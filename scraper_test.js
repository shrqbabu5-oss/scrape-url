const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://replit.com/@shrqbabu/Gemini-Hub';

const CHROMIUM_PATH = fs.existsSync('/opt/google/chrome/chrome')
  ? '/opt/google/chrome/chrome'
  : '/usr/bin/google-chrome';

// ============================================================
// CONFIG
// ============================================================

const PROFILE_DIR = path.join(__dirname, 'profile');

// Cookie JSON GitHub Secret / environment variable se
const REPLIT_COOKIES = [
    {
        "domain": "replit.com",
        "expirationDate": 1821159935,
        "hostOnly": true,
        "httpOnly": false,
        "name": "replit_statsig_stable_id",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "35315901-d49f-4f3b-b69f-5936d38cab15"
    },
    {
        "domain": "replit.com",
        "expirationDate": 1791719701,
        "hostOnly": true,
        "httpOnly": false,
        "name": "_replit_sid",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "5eba0a4a-3f76-4bbe-88b1-6fd565b41bbd"
    },
    {
        "domain": ".replit.com",
        "expirationDate": 1822650904,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__stripe_mid",
        "path": "/",
        "sameSite": "strict",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "29d91f36-8495-4b76-ba05-2dc48928dfd31528ad"
    },
    {
        "domain": ".replit.com",
        "expirationDate": 1791116384.847124,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__cf_bm",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "W2hbcnBRSwU2guZbG7ID_VcprJhhDcoggBH4mg6CDpA-1791114583.151279-1.0.1.1-rghgsEK.TaU9iuo8vRoLQ.I6HLD8VHYL2l3IPeI_ZAOU6VeQD4UeD80Ni.hvizThOScbAWgk5uiOhyPs15msJP1qjT5vLy15qwblu8NaPKrqNonGDVvFOBpBIHc92Rol"
    },
    {
        "domain": "replit.com",
        "expirationDate": 1791115776.410245,
        "hostOnly": true,
        "httpOnly": true,
        "name": "__Host-session-sig",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImNmLWp3dC0yMDI2LTA1LTA2LTE4MDMiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiI2MjQwMzgzOCIsInRjIjoxNzg0NDAyNTE5LCJlbnQiOmZhbHNlLCJwYWlkIjpmYWxzZSwiaWF0IjoxNzkxMTE0ODc0LCJleHAiOjE3OTExMTU3NzR9.cYecZ1nl5utnNgFJWBiTMN0Fh1QUC1EL24NHSNgKm68U4_Rgcdera-2bJPptF1lL6XsWUz2q6fi8F7ifK_WPVmG9AflmEJZDtb45RWdODWrt1Kkgl4di-n89q5OfisTW714o5c3xaab-MpPY1b0T7vR4QpScxhDy7xMX6r_mZ8Y5nJWy-kVxd19rwSAqueuO6KWYXNzhMqc8k9skzgJV5Limdxs26p4AulrbG2CcXnzJSlSdIaVkqanqVI7x7NH_T7o-NGoGw--xfIrPZx0xja8F9Ru7q9yxT_aVDsteIsJD1Sjw4xxKxwgglBA45TuB0YJ8SiLvhkTQVqBawTkUOQ"
    },
    {
        "domain": "replit.com",
        "expirationDate": 1791115776.410099,
        "hostOnly": true,
        "httpOnly": true,
        "name": "__Host-wr-tc",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "1784402519"
    },
    {
        "domain": ".replit.com",
        "expirationDate": 1791116704,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__stripe_sid",
        "path": "/",
        "sameSite": "strict",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "57802092-f882-4a86-9275-b47d7f01b4f5ddaa69"
    },
    {
        "domain": ".replit.com",
        "hostOnly": false,
        "httpOnly": true,
        "name": "_cfuvid",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": true,
        "storeId": null,
        "value": "bfDUhY45GReZz7ShV1SQEp0EcfHp9jn7_kZNNgiJID4-1791109924.5388274-1.0.1.1-4VphbpBgs0RlUVKVmYzE_BPtdXBLLwSblwY0ikkjjzE"
    },
    {
        "domain": "replit.com",
        "expirationDate": 1792322960.725184,
        "hostOnly": true,
        "httpOnly": true,
        "name": "connect.sid",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "eyJhbGciOiJSUzI1NiIsImtpZCI6Iktna0hjZyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9yZXBsaXQtd2ViIiwibmFtZSI6InNocnEgYmFidSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJNm0xcmtWQ0lfUFJidFdqMm14eVExV3FCQzAyWGltbFN3TEszMHVKcVRDbGtscHdcdTAwM2RzOTYtYyIsInJvbGVzIjpbXSwicmVwbGl0X3VzZXJfaWQiOjYyNDAzODM4LCJhdWQiOiJyZXBsaXQtd2ViIiwiYXV0aF90aW1lIjoxNzkwNDA3NTU1LCJ1c2VyX2lkIjoiTWZEWEpOaU80cU1Db3pXN29FeE5GbUdpWXV3MSIsInN1YiI6Ik1mRFhKTmlPNHFNQ296VzdvRXhORm1HaVl1dzEiLCJpYXQiOjE3OTExMTMzNTgsImV4cCI6MTc5MjMyMjk1OCwiZW1haWwiOiJzaHJxYmFidTVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMTM4MDQxNjQ0NzUzMzc5ODYxMTgiXSwiZW1haWwiOlsic2hycWJhYnU1QGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.CAWuds9BMT3U5Lws6YQpl7Ud60mINqrtMvJNtB_Ne3JlvkD-CiDCAgnPadP6KTDONdoGlLmfSZTglKQ8qrTeMK_gCPWUGZ6v8mdWOQ6RQ35fyvvQJ9ZaI_EsQAmPXYp6v0saj5nWMg4xuOyeo_V2U7LusbBZ9sAvZz2cgezVGS5dYQBC7JHxFzBcnIAXE2RSJL7ImFczHm9WrVKl0c1wNYH0UKicicDs7eANFALI5dhodKvJyvjnQqTGjKQBUuu1iZareofGqHf1Zb2oZhZnESjymqYUJJ5WSztP7AK2xgqxZceyjn9WDs-ByEl88riFCJM1q3u6B4z_JMBCx21YGw"
    },
    {
        "domain": ".replit.com",
        "expirationDate": 1797399939.137305,
        "hostOnly": false,
        "httpOnly": false,
        "name": "FPAU",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "1.2.305952251.1789623938"
    },
    {
        "domain": ".replit.com",
        "expirationDate": 1825427178.576024,
        "hostOnly": false,
        "httpOnly": true,
        "name": "FPID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "FPID2.2.tkAKwpmRziYmC%2BpwSGAyFh%2BWKEHxc8G8o6kNrQbhlYI%3D.1789623938"
    }
];

// ============================================================
// PROFILE
// ============================================================

if (!fs.existsSync(PROFILE_DIR)) {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
}

// ============================================================
// COOKIE LOADER
// ============================================================

async function loadCookies(page) {
  if (!REPLIT_COOKIES) {
    console.log('🍪 REPLIT_COOKIES not configured.');
    console.log('   Using existing Chrome profile if available.');
    return;
  }

  try {
    const cookies = JSON.parse(REPLIT_COOKIES);

    if (!Array.isArray(cookies)) {
      throw new Error('REPLIT_COOKIES must be a JSON array');
    }

    await page.setCookie(...cookies);

    console.log(`🍪 ${cookies.length} Replit cookie(s) loaded.`);
  } catch (error) {
    console.error('❌ Failed to load REPLIT_COOKIES:');
    console.error(error.message);
  }
}

// ============================================================
// MAIN
// ============================================================

async function start() {
  console.log('====================================================');
  console.log('             REPLIT AUTO RUNNER                     ');
  console.log('====================================================');
  console.log('Target URL :', TARGET_URL);
  console.log('Browser    :', CHROMIUM_PATH);
  console.log('Profile    :', PROFILE_DIR);
  console.log('Proxy      : Disabled');
  console.log('====================================================\n');

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

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/130.0.0.0 Safari/537.36'
    );

    // --------------------------------------------------------
    // Load authentication cookies
    // --------------------------------------------------------

    await loadCookies(page);

    // --------------------------------------------------------
    // Open Replit
    // --------------------------------------------------------

    console.log('🌐 Opening Replit...');

    await page.goto(TARGET_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }).catch(error => {
      console.log('⚠️ Navigation:', error.message);
    });

    // Give Replit UI time to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('📄 Current URL:', page.url());
    console.log('📄 Page title:', await page.title().catch(() => ''));

    // --------------------------------------------------------
    // Check if page redirected to login
    // --------------------------------------------------------

    const currentUrl = page.url();

    if (
      currentUrl.includes('/login') ||
      currentUrl.includes('/signup') ||
      currentUrl.includes('/auth')
    ) {
      console.log('');
      console.log('❌ Replit login session is not available.');
      console.log('   Check REPLIT_COOKIES or cached profile.');
      console.log('');
      return;
    }

    // --------------------------------------------------------
    // Find Run button
    // --------------------------------------------------------

    console.log('🔎 Looking for Run button...\n');

    let clickedSuccess = false;

    for (let attempt = 1; attempt <= 15; attempt++) {
      console.log(
        `[${new Date().toLocaleTimeString()}] ` +
        `Checking Run button (${attempt}/15)...`
      );

      const result = await page.evaluate(() => {
        // Direct selectors
        const directSelectors = [
          '[action="run_button_used"]',
          '[data-action="run_button_used"]',
          '[data-analytics*="run_button_used"]',
          'button[aria-label*="Run"]'
        ];

        for (const selector of directSelectors) {
          const element = document.querySelector(selector);

          if (element) {
            const button =
              element.closest('button') || element;

            if (!button.disabled) {
              button.click();

              return {
                success: true,
                method: selector,
                text: (
                  button.innerText ||
                  button.textContent ||
                  ''
                ).trim()
              };
            }
          }
        }

        // Text based detection
        const elements = Array.from(
          document.querySelectorAll(
            'button, div[role="button"], a'
          )
        );

        for (const element of elements) {
          const text = (
            element.innerText ||
            element.textContent ||
            ''
          ).trim();

          if (
            text === 'Run' ||
            text === '▶ Run' ||
            text.includes('Run .replit run command')
          ) {
            const button =
              element.closest('button') || element;

            if (!button.disabled) {
              button.click();

              return {
                success: true,
                method: 'text',
                text
              };
            }
          }
        }

        return {
          success: false
        };
      });

      if (result.success) {
        console.log('');
        console.log(
          `🚀 SUCCESS: Run button clicked!`
        );
        console.log(`   Method: ${result.method}`);
        console.log(`   Text  : ${result.text}`);

        clickedSuccess = true;

        console.log('');
        console.log(
          '⏳ Waiting 25 seconds for Replit container...'
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

    // --------------------------------------------------------
    // Result
    // --------------------------------------------------------

    if (clickedSuccess) {
      console.log('');
      console.log('✅ Replit workflow completed successfully.');
      console.log('💾 Chrome profile will be cached.');
    } else {
      console.log('');
      console.log(
        '⚠️ Run button was not detected within the timeout.'
      );
    }

  } finally {
    await browser.close().catch(() => {});
  }
}

// ============================================================
// START
// ============================================================

start().catch(error => {
  console.error('');
  console.error('❌ Fatal Error:');
  console.error(error);
  process.exit(1);
});
