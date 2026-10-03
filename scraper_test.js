const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const TARGET_CHANNELS = [
  { id: "ten1", title: "Sony Sports Ten 1 HD", url: "https://playsza.ru/player.php?id=ten1" },
  { id: "willow", title: "Willow Cricket HD", url: "https://playsza.ru/player.php?id=willow" },
  { id: "willow2", title: "Willow 2 / Extra HD", url: "https://playsza.ru/player.php?id=willow2" },
  { id: "willowhd", title: "Willow 4K HD", url: "https://playsza.ru/player.php?id=willowhd" },
  { id: "starsp4", title: "Star Sport 2 HD", url: "https://playsza.ru/player.php?id=starsp4" }
];

async function verifyStream(streamUrl, referer = "https://playsza.xyz/") {
  try {
    const res = await fetch(streamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
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
  await page.setViewport({ width: 1366, height: 768 });

  // Set required headers for embed permission
  await page.setExtraHTTPHeaders({
    "Referer": "https://crichd.mobile/",
    "Accept-Language": "en-US,en;q=0.9",
    "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
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
    console.log(`⏳ Loading ${channel.url} with Referer: https://crichd.mobile/ ...`);
    await page.goto(channel.url, { waitUntil: "networkidle2", timeout: 30000 }).catch(() => {});

    // Check DOM and iframes
    for (let sec = 1; sec <= 15; sec++) {
      if (sniffedStreamUrl) break;

      const pageTitle = await page.title().catch(() => "");
      const currentUrl = page.url();

      // If Cloudflare Turnstile Challenge is on screen, try auto-clicking the challenge box
      try {
        const frames = page.frames();
        for (const frame of frames) {
          const frameUrl = frame.url();
          if (frameUrl.includes("challenges.cloudflare.com") || frameUrl.includes("turnstile")) {
            console.log(`🛡️ Detected Cloudflare Turnstile iframe, attempting interaction...`);
            const checkbox = await frame.$("input[type=checkbox], .ctp-checkbox-label, #challenge-stage");
            if (checkbox) {
              await checkbox.click().catch(() => {});
            }
          }
        }
      } catch (_) {}

      // Check video / player objects in all frames
      try {
        const foundUrl = await page.evaluate(() => {
          const v = document.querySelector("video");
          if (v && v.src && v.src.includes(".m3u8")) return v.src;
          const ifr = document.querySelector("iframe");
          if (ifr && ifr.src && ifr.src.includes(".m3u8")) return ifr.src;
          // Check Clappr / HLS.js instance in window
          if (window.player && window.player.options && window.player.options.source) {
            return window.player.options.source;
          }
          return null;
        });

        if (foundUrl) {
          sniffedStreamUrl = foundUrl;
          console.log(`🎯 [FOUND IN PAGE DOM]: ${foundUrl}`);
          break;
        }
      } catch (_) {}

      if (sec === 5) {
        console.log(`ℹ️ [State at 5s] Page Title: "${pageTitle}" | Current URL: ${currentUrl}`);
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!sniffedStreamUrl) {
      const finalTitle = await page.title().catch(() => "");
      const bodySnippet = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || "").catch(() => "");
      console.log(`❌ [FAILED] Page Title: "${finalTitle}"`);
      console.log(`   Body preview: ${bodySnippet.replace(/\n+/g, " ")}`);
      await page.close();
      return { id: channel.id, title: channel.title, pass: false, error: `Blocked / Turnstile (${finalTitle})` };
    }

    await page.close();

    console.log(`📡 Verifying live playback for sniffed stream...`);
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
  console.log("🚀 Starting Cloudflare Chromium Live Stream Scraper Test...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--window-size=1366,768"
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
    console.log("\n🎉 ALL TESTS PASSED (100%)! Chromium scraper is working.");
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
