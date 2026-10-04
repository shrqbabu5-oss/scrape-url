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
        "expirationDate": 1791731542,
        "hostOnly": true,
        "httpOnly": false,
        "name": "_replit_sid",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "74f048c5-4e40-49aa-9a66-9002a9c68d01"
    },
    {
        "domain": ".replit.com",
        "expirationDate": 1822662747,
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
        "expirationDate": 1791128542.352147,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__cf_bm",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "6XxUqfIILd6jceEJL3dlkhU8NIizk3hzDWqG0NYMhgM-1791126740.1642482-1.0.1.1-QXXl1mkTWVUcaZpOpY.O4iw.QPcjTRR1dd1TRaXjdLBptqY9mDs0yMQojCxSK6o9KTnAo90LXFK5v4sb5Ylir9aJ.MA84JQNhCnxl9KUCFc0oSrQtYwGqWG3aUHEHH.1"
    },
    {
        "domain": "replit.com",
        "expirationDate": 1791127638.558402,
        "hostOnly": true,
        "httpOnly": true,
        "name": "__Host-session-sig",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImNmLWp3dC0yMDI2LTA1LTA2LTE4MDMiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiI2MjQwMzgzOCIsInRjIjoxNzg0NDAyNTE5LCJlbnQiOmZhbHNlLCJwYWlkIjpmYWxzZSwiaWF0IjoxNzkxMTI2NzM1LCJleHAiOjE3OTExMjc2MzV9.TSSxOdGI3T2nrPNgyaN0qvhuvlrB3Fc7hLIwnQaZ1sC-kpymQOkp1zAJbcDdYXpCWL4U2MsNMCmb9KOrlQ9HBUiwvpTkSfbOfyX4kwtmGEMJt1VMRXBM25ME6-4JgYVwzeNSKtcjc6aORbleSbUgp94K1Xaj0qOyh6i5OXiziL2_uXmWPPoWEfZsNf9dR0iUKYCUNu2G6IslUXOyK_NDKoveaBCw2aPQGUH8bzNtUX3mxLNuyxjgUxrMYje4g01TpA1tQtgDGQWW8-1tozSteZfljm9mkAoj_8Ubp71kW5l_Y7AulHol0Duw1sr1D3LKJptGWHlUHN1N8Un-dsw8ew"
    },
    {
        "domain": "replit.com",
        "expirationDate": 1791127638.558158,
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
        "expirationDate": 1791128547,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__stripe_sid",
        "path": "/",
        "sameSite": "strict",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "a4fb1932-408c-4c07-a002-cfb961627454ebcf75"
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
        "value": "QvjnR.6yA20JEUf9AFf_DlFrOMYQSM.df0AVebYbi1k-1791123695.2758086-1.0.1.1-e2zz.fDZctemCNbFOIVwtG3qG6Trr8O3M6Yt0ZxTlbc"
    },
    {
        "domain": "replit.com",
        "expirationDate": 1792334804.815661,
        "hostOnly": true,
        "httpOnly": true,
        "name": "connect.sid",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "eyJhbGciOiJSUzI1NiIsImtpZCI6Iktna0hjZyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9yZXBsaXQtd2ViIiwibmFtZSI6InNocnEgYmFidSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJNm0xcmtWQ0lfUFJidFdqMm14eVExV3FCQzAyWGltbFN3TEszMHVKcVRDbGtscHdcdTAwM2RzOTYtYyIsInJvbGVzIjpbXSwicmVwbGl0X3VzZXJfaWQiOjYyNDAzODM4LCJhdWQiOiJyZXBsaXQtd2ViIiwiYXV0aF90aW1lIjoxNzkwNDA3NTU1LCJ1c2VyX2lkIjoiTWZEWEpOaU80cU1Db3pXN29FeE5GbUdpWXV3MSIsInN1YiI6Ik1mRFhKTmlPNHFNQ296VzdvRXhORm1HaVl1dzEiLCJpYXQiOjE3OTExMjUyMDIsImV4cCI6MTc5MjMzNDgwMiwiZW1haWwiOiJzaHJxYmFidTVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMTM4MDQxNjQ0NzUzMzc5ODYxMTgiXSwiZW1haWwiOlsic2hycWJhYnU1QGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.Xjd7dnBbBoai0bVlMHWyq2cAYbSukssoEhQrMjhrJDSEnp-Tu6ntNxlGTriorRPSktCAVw66zaRJg4YJDLOVS6DUY265zzFr14VbqAhHPHwQNryyaKW6Hv7rhreLyVl4AYhXjXELOy6CQKp-ZuolQbIvpe6qLqzhSUEtR0IcyW9_Lb06LGoEI0qksxEXZ7FrfwddoS-6sHL0ZMObLGwgU5pOP62vGjTfjEfGqWa3MjrUPzW1jRhv6bb2bccyoKzkd4C7wHyEbQVKks6XFati1Vi0e86UJbUcKkCVY5LMvOVSrZgJnzaiZdl0vEw_uWd31bdiIUYYZjuDmKb1OWHLNQ"
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
        console.log('⚠️ Skipping invalid cookie.');
        continue;
      }

      const cleanCookie = {
        name: String(cookie.name),
        value: String(cookie.value),
        domain: cookie.domain || '.replit.com',
        path: cookie.path || '/'
      };

      // Only send sameSite if it is actually a valid string
      if (
        typeof cookie.sameSite === 'string' &&
        ['Strict', 'Lax', 'None'].includes(cookie.sameSite)
      ) {
        cleanCookie.sameSite = cookie.sameSite;
      }

      if (typeof cookie.secure === 'boolean') {
        cleanCookie.secure = cookie.secure;
      }

      if (typeof cookie.httpOnly === 'boolean') {
        cleanCookie.httpOnly = cookie.httpOnly;
      }

      if (
        typeof cookie.expires === 'number' &&
        cookie.expires > 0
      ) {
        cleanCookie.expires = cookie.expires;
      }

      await page.setCookie(cleanCookie);

      console.log(`   ✅ ${cleanCookie.name}`);

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
