const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://replit.com/@shrqbabu/Gemini-Hub';

const CHROMIUM_PATH = fs.existsSync('/opt/google/chrome/chrome')
  ? '/opt/google/chrome/chrome'
  : '/usr/bin/google-chrome';

const PROFILE_DIR = path.join(__dirname, 'profile');

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
        "expirationDate": 1791117285.145557,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__cf_bm",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "ym0AZEsA2085jfZRCy.h2Dj8NGjlt.t_mG4ZPgrbIpc-1791115483.122239-1.0.1.1-eG8Q9NRS7yzypsZ7QDp34KgPoYOky_LD0E3JBAgaMWb4dBaFUkrkP5b5jbKhovc6LfDWzC1qg4Dk5ngO36.StGyn.kc2kdOFsBhmIXNkS92wUpOX.23My7yj2gJWEgzd"
    },
    {
        "domain": "replit.com",
        "expirationDate": 1791116290.817078,
        "hostOnly": true,
        "httpOnly": true,
        "name": "__Host-session-sig",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImNmLWp3dC0yMDI2LTA1LTA2LTE4MDMiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiI2MjQwMzgzOCIsInRjIjoxNzg0NDAyNTE5LCJlbnQiOmZhbHNlLCJwYWlkIjpmYWxzZSwiaWF0IjoxNzkxMTE1Mzg4LCJleHAiOjE3OTExMTYyODh9.bI7Ox8_uYF_HCI-Acegn538r_h_cKbqihqR0XYgW9042BcpO2mByt8iDdLv4W3XzmHh1qEC257wEtbVppH0nwqELW5Ktti5i5pkDAZ08AlmeuJ_To0-7du-aijlFMG1O6hbkUn2buitXPHONoAbHV7gIYtut_X2b3CEp-L6ZAi91-6E07fCXXM2DAGUE0o1vjLW0klr66Dle5h_uEW1GZ3OK330gT-miCI8ADkkdNPOVyxG5xhQBNQfFmf5UGUQ4Cf2ZidqUNYn0W1jq9D5bX7Vl7ydQuWbnZq5KzOzrN17P4hrYu2CzHja6KiiVycWOGPAPCyXq7Ksjc9Z7BOU5TQ"
    },
    {
        "domain": "replit.com",
        "expirationDate": 1791116290.816936,
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

if (!fs.existsSync(PROFILE_DIR)) {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
}

// ============================================================
// LOAD COOKIES
// ============================================================

async function loadCookies(page) {
  if (!REPLIT_COOKIES) {
    console.log('🍪 No REPLIT_COOKIES secret found.');
    console.log('   Using cached Chrome profile.');
    return true;
  }

  // Detect common wrong secret value
  if (
    REPLIT_COOKIES === '[object Object]' ||
    REPLIT_COOKIES === 'undefined' ||
    REPLIT_COOKIES === 'null'
  ) {
    console.log('');
    console.log('❌ REPLIT_COOKIES is invalid.');
    console.log(
      '   GitHub Secret contains an object instead of JSON.'
    );
    console.log('');
    console.log('Expected format:');
    console.log(
      '[{"name":"COOKIE_NAME","value":"COOKIE_VALUE","domain":".replit.com","path":"/"}]'
    );
    console.log('');
    return false;
  }

  try {
    const cookies = JSON.parse(REPLIT_COOKIES);

    if (!Array.isArray(cookies)) {
      console.log(
        '❌ REPLIT_COOKIES must contain a JSON array.'
      );
      return false;
    }

    const validCookies = cookies
      .filter(cookie =>
        cookie &&
        typeof cookie === 'object' &&
        cookie.name &&
        cookie.value
      )
      .map(cookie => ({
        name: String(cookie.name),
        value: String(cookie.value),
        domain: cookie.domain || '.replit.com',
        path: cookie.path || '/',
        ...(cookie.httpOnly !== undefined
          ? { httpOnly: Boolean(cookie.httpOnly) }
          : {}),
        ...(cookie.secure !== undefined
          ? { secure: Boolean(cookie.secure) }
          : {})
      }));

    if (!validCookies.length) {
      console.log('❌ No valid cookies found.');
      return false;
    }

    await page.setCookie(...validCookies);

    console.log(
      `🍪 Loaded ${validCookies.length} Replit cookie(s).`
    );

    return true;

  } catch (error) {
    console.log('');
    console.log('❌ Failed to parse REPLIT_COOKIES.');
    console.log('   Error:', error.message);
    console.log('');
    console.log(
      '   The GitHub Secret must be a JSON string.'
    );
    console.log('');

    return false;
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
  console.log('====================================================');
  console.log('');

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
    // Cookies
    // --------------------------------------------------------

    await loadCookies(page);

    // --------------------------------------------------------
    // Navigate
    // --------------------------------------------------------

    console.log('🌐 Opening Replit...');

    const response = await page.goto(TARGET_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }).catch(error => {
      console.log(
        '⚠️ Navigation error:',
        error.message
      );

      return null;
    });

    await new Promise(resolve =>
      setTimeout(resolve, 5000)
    );

    const statusCode = response
      ? response.status()
      : null;

    const currentUrl = page.url();
    const title = await page.title().catch(() => '');

    console.log('');
    console.log('📄 HTTP Status:', statusCode);
    console.log('📄 Current URL:', currentUrl);
    console.log('📄 Page title :', title);
    console.log('');

    // --------------------------------------------------------
    // 404 detection
    // --------------------------------------------------------

    if (statusCode === 404 || title.includes('404')) {
      console.log(
        '❌ Replit returned HTTP 404.'
      );
      console.log('');
      console.log(
        'The problem is not the Run button.'
      );
      console.log(
        'Check that TARGET_URL points to the correct Replit project.'
      );
      console.log('');

      return;
    }

    // --------------------------------------------------------
    // Login detection
    // --------------------------------------------------------

    if (
      currentUrl.includes('/login') ||
      currentUrl.includes('/signup') ||
      currentUrl.includes('/auth')
    ) {
      console.log(
        '❌ Replit session is not authenticated.'
      );
      console.log(
        'Check REPLIT_COOKIES or the cached profile.'
      );

      return;
    }

    // --------------------------------------------------------
    // Find Run button
    // --------------------------------------------------------

    console.log(
      '🔎 Looking for Run button...\n'
    );

    let clickedSuccess = false;

    for (let attempt = 1; attempt <= 15; attempt++) {

      console.log(
        `[${new Date().toLocaleTimeString()}] ` +
        `Checking Run button (${attempt}/15)...`
      );

      const result = await page.evaluate(() => {

        const selectors = [
          '[action="run_button_used"]',
          '[data-action="run_button_used"]',
          '[data-analytics*="run_button_used"]',
          'button[aria-label*="Run"]'
        ];

        for (const selector of selectors) {

          const element =
            document.querySelector(selector);

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
            text.includes(
              'Run .replit run command'
            )
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
          '🚀 SUCCESS: Run button clicked!'
        );

        console.log(
          'Method:',
          result.method
        );

        console.log(
          'Text:',
          result.text
        );

        clickedSuccess = true;

        console.log('');
        console.log(
          '⏳ Waiting 25 seconds for container...'
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

    if (clickedSuccess) {
      console.log('');
      console.log(
        '✅ Replit workflow completed successfully.'
      );
      console.log(
        '💾 Profile will be cached.'
      );
    } else {
      console.log('');
      console.log(
        '⚠️ Run button was not detected.'
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
