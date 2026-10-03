const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const TARGET_CHANNELS = [
  { id: "ten1", title: "Sony Sports Ten 1 HD", url: "https://playsza.ru/player.php?id=ten1" },
  { id: "willow", title: "Willow Cricket HD", url: "https://playsza.ru/player.php?id=willow" },
  { id: "willow2", title: "Willow 2 / Extra HD", url: "https://playsza.ru/player.php?id=willow2" }
];

async function verifyStream(streamUrl, referer = "https://playsza.xyz/") {
  try {
    const res = await fetch(streamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Referer": referer,
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }

    const text = await res.text();
    if (!text.includes("#EXTM3U")) {
      return { ok: false, error: "Not a valid M3U8 playlist" };
    }

    const lines = text.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
    if (lines.length === 0) {
      return { ok: false, error: "Empty playlist" };
    }

    let chunkUrl = lines[0];
    if (!chunkUrl.startsWith("http")) {
      chunkUrl = new URL(chunkUrl, streamUrl).href;
    }

    const chunkRes = await fetch(chunkUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": referer,
      },
      signal: AbortSignal.timeout(8000),
    });

    if (chunkRes.ok) {
      const len = chunkRes.headers.get("content-length") || "chunked";
      return { ok: true, chunkBytes: len, chunkStatus: chunkRes.status };
    } else {
      return { ok: false, error: `Chunk HTTP ${chunkRes.status}` };
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function testChannel(browser, channel) {
  console.log(`\n======================================================`);
  console.log(`🔍 [Testing Channel] ${channel.title} (${channel.id})`);
  console.log(`🌐 Target Embed URL: ${channel.url}`);
  console.log(`======================================================`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36");

  await page.setExtraHTTPHeaders({
    "Referer": "https://crichd.mobile/",
    "Accept-Language": "en-US,en;q=0.9",
    "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"'
  });

  let sniffedStreamUrl = null;

  // Intercept all network traffic
  page.on("request", (req) => {
    const reqUrl = req.url();
    if (
      reqUrl.includes(".m3u8") &&
      (reqUrl.includes("bhalocast.com") || reqUrl.includes("md5=") || reqUrl.includes("/hls/"))
    ) {
      if (!sniffedStreamUrl) {
        sniffedStreamUrl = reqUrl;
        console.log(`🎯 [SNIFFED .M3U8 ON REQUEST]: ${reqUrl}`);
      }
    }
  });

  page.on("response", async (res) => {
    const resUrl = res.url();
    if (
      resUrl.includes(".m3u8") &&
      (resUrl.includes("bhalocast.com") || resUrl.includes("md5=") || resUrl.includes("/hls/"))
    ) {
      if (!sniffedStreamUrl) {
        sniffedStreamUrl = resUrl;
        console.log(`🎯 [SNIFFED .M3U8 ON RESPONSE]: ${resUrl}`);
      }
    }
  });

  try {
    console.log(`⏳ Loading ${channel.url} under Xvfb display...`);
    await page.goto(channel.url, { waitUntil: "domcontentloaded", timeout: 35000 }).catch(() => {});

    // Monitor for 20 seconds and auto-click Turnstile if present
    for (let sec = 1; sec <= 20; sec++) {
      if (sniffedStreamUrl) break;

      const pageTitle = await page.title().catch(() => "");

      // Check for Cloudflare Turnstile iframe and simulate real mouse click
      try {
        const turnstileIframe = await page.$('iframe[src*="challenges.cloudflare.com"], iframe[src*="turnstile"]');
        if (turnstileIframe) {
          const box = await turnstileIframe.boundingBox();
          if (box) {
            console.log(`🛡️ [Sec ${sec}] Found Turnstile widget at (${Math.round(box.x)}, ${Math.round(box.y)}). Simulating mouse click...`);
            await page.mouse.move(box.x + 35, box.y + box.height / 2, { steps: 5 });
            await new Promise(r => setTimeout(r, 150));
            await page.mouse.down();
            await new Promise(r => setTimeout(r, 100));
            await page.mouse.up();
          }
        }
      } catch (_) {}

      // Check video elements in DOM
      try {
        const foundUrl = await page.evaluate(() => {
          const v = document.querySelector("video");
          if (v && v.src && v.src.includes(".m3u8")) return v.src;
          const ifr = document.querySelector("iframe");
          if (ifr && ifr.src && ifr.src.includes(".m3u8")) return ifr.src;
          if (window.player && window.player.options && window.player.options.source) {
            return window.player.options.source;
          }
          return null;
        });

        if (foundUrl) {
          sniffedStreamUrl = foundUrl;
          console.log(`🎯 [FOUND IN DOM]: ${foundUrl}`);
          break;
        }
      } catch (_) {}

      if (sec % 5 === 0) {
        console.log(`ℹ️ [State at ${sec}s] Page Title: "${pageTitle}"`);
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!sniffedStreamUrl) {
      const finalTitle = await page.title().catch(() => "");
      console.log(`❌ [FAILED] Page Title: "${finalTitle}"`);
      await page.close().catch(() => {});
      return { id: channel.id, title: channel.title, pass: false, error: `Turnstile / No stream (${finalTitle})` };
    }

    await page.close().catch(() => {});

    console.log(`📡 Verifying live playback & downloading chunk...`);
    const verification = await verifyStream(sniffedStreamUrl, "https://playsza.xyz/");

    if (verification.ok) {
      let validityMinutes = "N/A";
      const expMatch = sniffedStreamUrl.match(/expires=(\d+)/);
      if (expMatch) {
        const expUnix = parseInt(expMatch[1], 10);
        validityMinutes = Math.round((expUnix * 1000 - Date.now()) / 60000) + " mins";
      }

      console.log(`✅ [100% PASS] Live Stream is Active and Playing!`);
      console.log(`   - Chunk Status: HTTP ${verification.chunkStatus} (${verification.chunkBytes} bytes)`);
      console.log(`   - Token Validity: ${validityMinutes}`);
      return { id: channel.id, title: channel.title, pass: true, streamUrl: sniffedStreamUrl, validity: validityMinutes };
    } else {
      console.log(`❌ [VERIFICATION FAILED]: ${verification.error}`);
      return { id: channel.id, title: channel.title, pass: false, error: verification.error };
    }
  } catch (err) {
    await page.close().catch(() => {});
    console.log(`❌ [ERROR] ${err.message}`);
    return { id: channel.id, title: channel.title, pass: false, error: err.message };
  }
}

async function run() {
  console.log("======================================================");
  console.log("🚀 Starting Xvfb Real Chrome Live Stream Scraper Test ");
  console.log("======================================================");

  const chromePath = fs.existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : undefined;
  if (chromePath) {
    console.log("🖥️ Using Google Chrome Binary:", chromePath);
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false, // Runs in real screen mode inside Xvfb display
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--window-size=1920,1080",
      "--start-maximized"
    ]
  });

  const results = [];

  for (const ch of TARGET_CHANNELS) {
    const res = await testChannel(browser, ch);
    results.push(res);
  }

  await browser.close();

  console.log("\n======================================================");
  console.log("📊 FINAL TEST SCORECARD");
  console.log("======================================================");
  console.table(results);

  const allPassed = results.every(r => r.pass);
  if (allPassed) {
    console.log("\n🎉 ALL TESTS PASSED (100%)! Headless Chrome on Xvfb successfully bypassed Cloudflare.");
    process.exit(0);
  } else {
    console.log("\n⚠️ Scraper finished. Check the log details above.");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal Runner Error:", err);
  process.exit(1);
});
