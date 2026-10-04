// npm install puppeteer-core

const puppeteer = require('puppeteer-core');

// ============================================================
// CONFIG
// ============================================================

const TARGET_URL = 'https://replit.com/@shrqbabu/Gemini-Hub';

const ZENROWS_API_KEY = (
  process.env.ZENROWS_API_KEY || ''
).trim();


// ============================================================
// HARD-CODED COOKIES
// ============================================================
//
// Apni Replit cookies yahan paste karo.
//
// Example:
//
// const REPLIT_COOKIES = [
//   {
//     name: 'cookie_name',
//     value: 'cookie_value',
//     domain: '.replit.com',
//     path: '/'
//   }
// ];
//
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


// ============================================================
// VALIDATE CONFIG
// ============================================================

if (!ZENROWS_API_KEY) {
  console.error('❌ ZENROWS_API_KEY is missing.');
  process.exit(1);
}


// ============================================================
// ZENROWS SCRAPING BROWSER
// ============================================================

const connectionURL =
  `wss://browser.zenrows.com?apikey=${encodeURIComponent(
    ZENROWS_API_KEY
  )}`;


// ============================================================
// LOAD COOKIES
// ============================================================

async function loadCookies(page) {

  if (
    !Array.isArray(REPLIT_COOKIES) ||
    REPLIT_COOKIES.length === 0
  ) {
    console.log('🍪 No hard-coded cookies configured.');
    return;
  }

  try {

    const cookies = REPLIT_COOKIES
      .filter(cookie =>
        cookie &&
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
          : {}),
        ...(cookie.sameSite
          ? { sameSite: cookie.sameSite }
          : {}),
        ...(cookie.expires
          ? { expires: Number(cookie.expires) }
          : {})
      }));

    if (!cookies.length) {
      console.log('⚠️ No valid cookies found.');
      return;
    }

    await page.setCookie(...cookies);

    console.log(
      `🍪 ${cookies.length} Replit cookie(s) loaded.`
    );

  } catch (error) {

    console.error(
      '❌ Cookie loading failed:',
      error.message
    );

  }
}


// ============================================================
// MAIN
// ============================================================

async function start() {

  console.log('====================================================');
  console.log('          ZENROWS REPLIT AUTO RUNNER                ');
  console.log('====================================================');

  console.log('Target :', TARGET_URL);
  console.log('Browser: ZenRows Scraping Browser');
  console.log('Proxy  : ZenRows Remote Browser');
  console.log('====================================================');
  console.log('');

  let browser;

  try {

    // --------------------------------------------------------
    // CONNECT TO ZENROWS REMOTE CHROME
    // --------------------------------------------------------

    console.log(
      '🔌 Connecting to ZenRows Scraping Browser...'
    );

    browser = await puppeteer.connect({
      browserWSEndpoint: connectionURL
    });

    console.log(
      '✅ Connected to ZenRows browser.'
    );


    // --------------------------------------------------------
    // CREATE PAGE
    // --------------------------------------------------------

    const page = await browser.newPage();

    await page.setViewport({
      width: 1280,
      height: 720
    });


    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/130.0.0.0 Safari/537.36'
    );


    // --------------------------------------------------------
    // COOKIES
    // --------------------------------------------------------

    await loadCookies(page);


    // --------------------------------------------------------
    // OPEN REPLIT
    // --------------------------------------------------------

    console.log('');
    console.log('🌐 Opening Replit...');

    const response = await page.goto(
      TARGET_URL,
      {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      }
    ).catch(error => {

      console.log(
        '⚠️ Navigation error:',
        error.message
      );

      return null;
    });


    // Allow UI to render
    await new Promise(resolve =>
      setTimeout(resolve, 5000)
    );


    // --------------------------------------------------------
    // PAGE INFORMATION
    // --------------------------------------------------------

    const statusCode = response
      ? response.status()
      : null;

    const currentUrl = page.url();

    const title = await page
      .title()
      .catch(() => '');


    console.log('');
    console.log('📄 HTTP Status:', statusCode);
    console.log('📄 Current URL:', currentUrl);
    console.log('📄 Page title :', title);
    console.log('');


    // --------------------------------------------------------
    // LOGIN CHECK
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
        '   Check your hard-coded cookies.'
      );

      return;
    }


    // --------------------------------------------------------
    // SECURITY CHALLENGE DETECTION
    // --------------------------------------------------------

    const lowerTitle = title.toLowerCase();

    if (
      statusCode === 403 &&
      (
        lowerTitle.includes('just a moment') ||
        lowerTitle.includes('checking your browser') ||
        lowerTitle.includes('security')
      )
    ) {

      console.log('');
      console.log(
        '⚠️ Security challenge detected.'
      );

      console.log(
        '   Run button is not available yet.'
      );

      return;
    }


    // --------------------------------------------------------
    // 404 CHECK
    // --------------------------------------------------------

    if (
      statusCode === 404 ||
      lowerTitle.includes('404')
    ) {

      console.log('');
      console.log(
        '❌ Replit returned 404.'
      );

      console.log(
        '   Check TARGET_URL.'
      );

      return;
    }


    // --------------------------------------------------------
    // FIND RUN BUTTON
    // --------------------------------------------------------

    console.log(
      '🔎 Looking for Run button...\n'
    );

    let clickedSuccess = false;


    // Maximum 15 attempts
    for (
      let attempt = 1;
      attempt <= 15;
      attempt++
    ) {

      console.log(
        `[${new Date().toLocaleTimeString()}] ` +
        `Checking Run button (${attempt}/15)...`
      );


      const result = await page.evaluate(() => {

        // ----------------------------------------------
        // Direct selectors
        // ----------------------------------------------

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


        // ----------------------------------------------
        // Text based detection
        // ----------------------------------------------

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


      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

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


      // Wait 8 seconds
      await new Promise(resolve =>
        setTimeout(resolve, 8000)
      );

    }


    // --------------------------------------------------------
    // RESULT
    // --------------------------------------------------------

    if (clickedSuccess) {

      console.log('');
      console.log(
        '✅ Replit workflow completed successfully.'
      );

    } else {

      console.log('');
      console.log(
        '⚠️ Run button was not detected.'
      );

    }

  } catch (error) {

    console.error('');
    console.error(
      '❌ Fatal Error:'
    );

    console.error(error);

    process.exitCode = 1;

  } finally {

    // --------------------------------------------------------
    // CLOSE ZENROWS BROWSER
    // --------------------------------------------------------

    if (browser) {

      await browser
        .close()
        .catch(() => {});

      console.log('');
      console.log(
        '🔌 ZenRows browser connection closed.'
      );
    }
  }
}


// ============================================================
// START
// ============================================================

start();
