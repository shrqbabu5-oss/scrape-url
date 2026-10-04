// npm install puppeteer-core

const puppeteer = require('puppeteer-core');

// ============================================================
// CONFIG
// ============================================================

const TARGET_URL = 'https://replit.com/@shrqbabu/Gemini-Hub';

const BROWSERLESS_TOKEN = (
  process.env.BROWSERLESS_TOKEN || '2VNbTximwc4XYKC15c29aeecd697096c6785cca3e5ca4aaf4'
).trim();


// ============================================================

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
        "expirationDate": 1791119244.274009,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__cf_bm",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "q6idKFo1PUy8yVUf__YlanUvzDByJQjpXxRa74geQKk-1791117442.232862-1.0.1.1-vurM5v.DPPMpVc6Vc9zPAEyuZ8RNC8wNBMo8XaVNZP_.JMFAdNEJT_AviAg.Wh1JH1oxvyUFpDEqaaMqfnWpeZg8wzpnGOWT5x.1RXDlJcSGIEBCHqBTGFkIiTljALwq"
    },
    {
        "domain": "replit.com",
        "expirationDate": 1791118344.273735,
        "hostOnly": true,
        "httpOnly": true,
        "name": "__Host-session-sig",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImNmLWp3dC0yMDI2LTA1LTA2LTE4MDMiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiI2MjQwMzgzOCIsInRjIjoxNzg0NDAyNTE5LCJlbnQiOmZhbHNlLCJwYWlkIjpmYWxzZSwiaWF0IjoxNzkxMTE3NDQyLCJleHAiOjE3OTExMTgzNDJ9.ZPaFl-0VHBSoxdMbyRXpgjm8JnmzSJpQ7tr6jh5rfxyoBK1TPp7dwBtUTxTb5ewQzjPPMz8RPd5-J7sa13EqGguTgARt6w9TCD15UtdrCb3k5xQxSfZkJH-EljD1kk0wu83aKD8dlEIHbHzBWeIglvN9VHn_Jsyx2bshjAszTlxrWUHFLNwJCaHOdBU5BQr0sILpEM8XauZlpdgjspR1KxeYe3xA2JXi5KApwHPV6lZ8U7V2uIzVM0FXK25-HQRRTExN7EUx9u0qiWBVFL2F2XF7ePGdVs8C57BjBgWm8y5IZeDIQ3xJbm82-MTZT9qskKLZN0MpQywqW2hNj5P9LA"
    },
    {
        "domain": "replit.com",
        "expirationDate": 1791118344.273493,
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
        "expirationDate": 1792326004.737819,
        "hostOnly": true,
        "httpOnly": true,
        "name": "connect.sid",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "eyJhbGciOiJSUzI1NiIsImtpZCI6Iktna0hjZyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9yZXBsaXQtd2ViIiwibmFtZSI6InNocnEgYmFidSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJNm0xcmtWQ0lfUFJidFdqMm14eVExV3FCQzAyWGltbFN3TEszMHVKcVRDbGtscHdcdTAwM2RzOTYtYyIsInJvbGVzIjpbXSwicmVwbGl0X3VzZXJfaWQiOjYyNDAzODM4LCJhdWQiOiJyZXBsaXQtd2ViIiwiYXV0aF90aW1lIjoxNzkwNDA3NTU1LCJ1c2VyX2lkIjoiTWZEWEpOaU80cU1Db3pXN29FeE5GbUdpWXV3MSIsInN1YiI6Ik1mRFhKTmlPNHFNQ296VzdvRXhORm1HaVl1dzEiLCJpYXQiOjE3OTExMTY0MDIsImV4cCI6MTc5MjMyNjAwMiwiZW1haWwiOiJzaHJxYmFidTVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMTM4MDQxNjQ0NzUzMzc5ODYxMTgiXSwiZW1haWwiOlsic2hycWJhYnU1QGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.N_lssGIy9JgvmeBqHJ9JxsQcXzsDtVFkr74zv1ckoK7w1o0vqYys7t3QoqSX_jH0MfBlwdmcESpdrod-ToqkkHBsuShRCwUDa8UGjXnmWHC0vpt-fbwpSzOPh1lGI1EKHaOq_0n49TgHjvg2-d8Zv_yeL_ZLsQtUEPwDJNzuSsln1QmWcZ5WjdReSUERsbqeVnS5mjSXZWlgVH6-lZ1b3X5MoR1UJ5ztdVHQMjXCW857wUMPNXlogEaDrWhEMbsCQTfX7MhAjrWNgQZkli_6QC5jtMr5HTKdCj_TzNvtLO0YY31YH0CgKDfRYichegtJE8RoWOCes99bbp8QligUFQ"
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


if (!BROWSERLESS_TOKEN) {
  console.error('❌ BROWSERLESS_TOKEN is missing.');
  process.exit(1);
}

const BROWSERLESS_WS =
  `wss://production-sfo.browserless.io?token=${encodeURIComponent(BROWSERLESS_TOKEN)}`;


// ============================================================
// USER AGENT
// ============================================================

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/130.0.0.0 Safari/537.36';

// ============================================================
// HELPERS
// ============================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadCookies(page) {
  if (!REPLIT_COOKIES.length) {
    console.log('🍪 No hard-coded cookies configured.');
    return;
  }

  console.log(`🍪 Loading ${REPLIT_COOKIES.length} Replit cookie(s)...`);

  for (const cookie of REPLIT_COOKIES) {
    try {
      if (!cookie.name || cookie.value === undefined) {
        console.log(`⚠️ Skipping invalid cookie.`);
        continue;
      }

      await page.setCookie({
        ...cookie,
        domain: cookie.domain || '.replit.com',
        path: cookie.path || '/'
      });

      console.log(`   ✅ ${cookie.name}`);
    } catch (error) {
      console.log(
        `   ⚠️ Failed: ${cookie.name} - ${error.message}`
      );
    }
  }
}

async function getPageState(page) {
  const title = await page.title().catch(() => '');
  const url = page.url();

  const bodyText = await page
    .evaluate(() => document.body?.innerText || '')
    .catch(() => '');

  const lowerTitle = title.toLowerCase();
  const lowerBody = bodyText.toLowerCase();

  const challenge =
    title.includes('Just a moment') ||
    lowerTitle.includes('checking your browser') ||
    lowerTitle.includes('attention required') ||
    lowerBody.includes('checking your browser') ||
    lowerBody.includes('verify you are human') ||
    lowerBody.includes('cf-chl') ||
    lowerBody.includes('cloudflare');

  return {
    title,
    url,
    status: null,
    challenge
  };
}

async function findRunButton(page) {
  return await page.evaluate(() => {
    const selectors = [
      '[action="run_button_used"]',
      '[data-action="run_button_used"]',
      '[data-analytics*="run_button_used"]',
      'button[aria-label*="Run"]',
      'button[title*="Run"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);

      if (element) {
        return {
          found: true,
          selector,
          text: (
            element.innerText ||
            element.textContent ||
            ''
          ).trim()
        };
      }
    }

    const elements = Array.from(
      document.querySelectorAll(
        'button, div[role="button"], a, span'
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
        return {
          found: true,
          selector: 'text',
          text
        };
      }
    }

    return {
      found: false
    };
  });
}

async function clickRunButton(page) {
  return await page.evaluate(() => {
    const selectors = [
      '[action="run_button_used"]',
      '[data-action="run_button_used"]',
      '[data-analytics*="run_button_used"]',
      'button[aria-label*="Run"]',
      'button[title*="Run"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);

      if (element) {
        const button =
          element.closest('button') || element;

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

    const elements = Array.from(
      document.querySelectorAll(
        'button, div[role="button"], a, span'
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

        button.click();

        return {
          success: true,
          method: 'text',
          text
        };
      }
    }

    return {
      success: false
    };
  });
}

// ============================================================
// MAIN
// ============================================================

async function start() {
  let browser = null;

  try {
    console.log('');
    console.log('====================================================');
    console.log('       BROWSERLESS REPLIT AUTO RUNNER               ');
    console.log('====================================================');
    console.log('');
    console.log('Target   :', TARGET_URL);
    console.log('Browser  : Browserless Remote Chrome');
    console.log('Cookies  :', REPLIT_COOKIES.length);
    console.log('');

    // --------------------------------------------------------
    // CONNECT TO BROWSERLESS
    // --------------------------------------------------------

    console.log('🔌 Connecting to Browserless...');

    browser = await puppeteer.connect({
      browserWSEndpoint: BROWSERLESS_WS,
      defaultViewport: {
        width: 1280,
        height: 720
      }
    });

    console.log('✅ Browserless connected.');

    // --------------------------------------------------------
    // CREATE PAGE
    // --------------------------------------------------------

    const page = await browser.newPage();

    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1
    });

    await page.setUserAgent(USER_AGENT);

    // --------------------------------------------------------
    // COOKIES
    // --------------------------------------------------------

    await page.goto('https://replit.com', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }).catch(() => {});

    await loadCookies(page);

    // --------------------------------------------------------
    // OPEN TARGET
    // --------------------------------------------------------

    console.log('');
    console.log('🌐 Opening Replit Workspace...');

    let response = null;

    try {
      response = await page.goto(TARGET_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
    } catch (error) {
      console.log(`⚠️ Navigation warning: ${error.message}`);
    }

    if (response) {
      console.log(
        `📄 HTTP Status: ${response.status()}`
      );
    }

    await sleep(3000);

    // --------------------------------------------------------
    // PAGE INFO
    // --------------------------------------------------------

    const state = await getPageState(page);

    console.log('📄 Current URL :', state.url);
    console.log('📄 Page title  :', state.title);

    // --------------------------------------------------------
    // CHALLENGE DETECTION
    // --------------------------------------------------------

    if (state.challenge) {
      console.log('');
      console.log('⚠️ Browser challenge detected.');
      console.log('');
      console.log(
        'The page is requiring a verification/challenge.'
      );
      console.log(
        'This script will NOT attempt to automatically solve it.'
      );
      console.log('');
      console.log('Stopping safely.');
      console.log('');

      process.exitCode = 2;
      return;
    }

    // --------------------------------------------------------
    // RUN BUTTON SEARCH
    // --------------------------------------------------------

    console.log('');
    console.log('🔎 Looking for Replit Run button...');
    console.log('');

    let clickedSuccess = false;

    // 15 attempts × 8 seconds = ~2 minutes
    for (let attempt = 1; attempt <= 15; attempt++) {

      console.log(
        `[${new Date().toLocaleTimeString()}] ` +
        `Checking Run button (${attempt}/15)...`
      );

      // Check if page became a challenge later
      const currentState = await getPageState(page);

      if (currentState.challenge) {
        console.log('');
        console.log('⚠️ Browser challenge appeared.');
        console.log('Stopping safely.');
        break;
      }

      const button = await findRunButton(page);

      if (button.found) {
        console.log(
          `✅ Run button found: ${button.text || button.selector}`
        );

        const clicked = await clickRunButton(page);

        if (clicked.success) {
          console.log('');
          console.log(
            `🚀 SUCCESS: Run button clicked!`
          );
          console.log(
            `   Method: ${clicked.method}`
          );

          clickedSuccess = true;

          console.log('');
          console.log(
            '⏳ Waiting 25 seconds for Replit container...'
          );

          await sleep(25000);

          break;
        }
      }

      await sleep(8000);
    }

    // --------------------------------------------------------
    // RESULT
    // --------------------------------------------------------

    console.log('');

    if (clickedSuccess) {
      console.log(
        '✅ Workflow completed successfully.'
      );
    } else {
      console.log(
        '⚠️ Run button was not detected.'
      );
      console.log(
        'The page may require authentication, '
        + 'a challenge may be present, or the UI changed.'
      );
    }

  } catch (error) {
    console.error('');
    console.error('❌ ERROR');
    console.error(error);
    process.exitCode = 1;

  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('🔌 Browserless connection closed.');
      } catch (_) {}
    }
  }
}

start();
