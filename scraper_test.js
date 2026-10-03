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

    // Parse lines and fetch first .ts video chunk
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
  await page.setViewport({ width: 1280, height: 720 });
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36");

  let sniffedStreamUrl = null;

  // Intercept all outgoing network requests
  page.on("request", (req) => {
    const reqUrl = req.url();
    if (
      reqUrl.includes(".m3u8") &&
      (reqUrl.includes("bhalocast.com") || reqUrl.includes("md5=") || reqUrl.includes("/hls/"))
    ) {
      if (!sniffedStreamUrl) {
        sniffedStreamUrl = reqUrl;
        console.log(`🎯 [SNIFFED .M3U8 TOKEN]: ${reqUrl}`);
      }
    }
  });

  try {
    console.log(`⏳ Loading page and waiting for Cloudflare verification...`);
    await page.goto(channel.url, { waitUntil: "domcontentloaded", timeout: 25000 });

    // Wait up to 15 seconds for video player initialization and network stream requests
    for (let i = 0; i < 15; i++) {
      if (sniffedStreamUrl) break;
      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!sniffedStreamUrl) {
      // Check iframe or video elements in DOM
      const videoSrc = await page.evaluate(() => {
        const v = document.querySelector("video");
        if (v && v.src) return v.src;
        const iframe = document.querySelector("iframe");
        if (iframe && iframe.src) return iframe.src;
        return null;
      });
      if (videoSrc && videoSrc.includes(".m3u8")) {
        sniffedStreamUrl = videoSrc;
        console.log(`🎯 [FOUND IN DOM]: ${videoSrc}`);
      }
    }

    await page.close();

    if (!sniffedStreamUrl) {
      console.log(`❌ [FAILED] Could not sniff .m3u8 token within timeout.`);
      return { id: channel.id, title: channel.title, pass: false, error: "Sniff Timeout / No .m3u8" };
    }

    console.log(`📡 Verifying live playback & chunk download for sniffed stream...`);
    const verification = await verifyStream(sniffedStreamUrl, "https://playsza.xyz/");

    if (verification.ok) {
      // Calculate remaining validity time if token has expires timestamp
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
      "--disable-gpu"
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
    console.log("\n🎉 ALL TESTS PASSED (100%)! Chromium scraper is ready for production integration.");
    process.exit(0);
  } else {
    console.log("\n⚠️ SOME TESTS FAILED. Inspect logs above for details.");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal Runner Error:", err);
  process.exit(1);
});
