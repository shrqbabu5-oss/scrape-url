// ================= CONFIGURATION =================

// 👉 APNI BROWSERLESS TOKEN YAHA DOUBLE QUOTES ME DAALEIN:
const BROWSERLESS_TOKEN = "2VNbTximwc4XYKC15c29aeecd697096c6785cca3e5ca4aaf4";

// Browserless WebSocket endpoint.
// Is stream scraper mein cookies ki zarurat nahi hai.
const BROWSERLESS_WS_ENDPOINT =
  `wss://production-sfo.browserless.io?token=${encodeURIComponent(BROWSERLESS_TOKEN)}`;

const SUPABASE_URL = "https://exaorbbpvxnogpbvyayx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW9yYmJwdnhub2dwYnZ5YXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjM4MDUsImV4cCI6MjEwNDY5OTgwNX0.mnV03xUfYtG5xFftaNNnkK_S7UkIGPLw5QTqcIf6aWs";
const TABLE_NAME = "live_channels";

const CHANNELS_TO_UPDATE = [
  {
    id: "starsp4",
    name: "Star Sports 2 (Eng)",
    pageUrl: "https://playsza.xyz/uembed.php?v=starsp4",
    referer: "https://playsza.xyz/",
    language: "English",
    category: "Cricket"
  },
  {
    id: "willowhd",
    name: "Willow HD",
    pageUrl: "https://playsza.xyz/uembed.php?v=hdwillow3c",
    referer: "https://playsza.xyz/",
    language: "English",
    category: "Cricket"
  },
  {
    id: "ten1",
    name: "Sony Sports 1 HD",
    pageUrl: "https://playsza.xyz/uembed.php?v=ten1",
    referer: "https://playsza.xyz/",
    language: "English",
    category: "Sports"
  },
  {
    id: "starsp2",
    name: "Star Sports 2 (Hi)",
    pageUrl: "https://playsza.xyz/uembed.php?v=starsp2",
    referer: "https://playsza.xyz/",
    language: "Hindi",
    category: "Cricket"
  }
];

const REFRESH_INTERVAL_MINUTES = parseInt(process.env.REFRESH_INTERVAL_MINUTES || '45', 10);

// ================= P.A.C.K.E.R UNPACKER =================

function unpackDeanEdwards(scriptText) {
  try {
    const match = scriptText.match(/}\s*\('(.*)',\s*(\d+),\s*(\d+),\s*'(.*)'\.split\('\|'\)/);
    if (!match) return scriptText;

    let [, p, a, c, k] = match;
    a = parseInt(a, 10);
    c = parseInt(c, 10);
    const dict = k.split('|');

    const e = (c) => (c < a ? '' : e(Math.floor(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));

    while (c--) {
      if (dict[c]) {
        p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), dict[c]);
      }
    }
    return p;
  } catch (_) {
    return scriptText;
  }
}

// ================= HTML STREAM EXTRACTOR =================

function extractM3u8FromHtml(html) {
  if (!html) return null;

  // M3U8 URLs observed by Browserless during normal page loading.
  const observedBlock = html.match(
    /<!-- BROWSERLESS_OBSERVED_M3U8\\n([\\s\\S]*?)\\n-->/
  );

  if (observedBlock) {
    const observedUrls = observedBlock[1]
      .split('\\n')
      .map(x => x.trim())
      .filter(Boolean);

    for (const url of observedUrls) {
      if (/^https?:\\/\\//i.test(url) && /\\.m3u8(?:[?#]|$)/i.test(url)) {
        return url;
      }
    }
  }

  // Unpack any packed scripts first
  let cleanHtml = html;
  if (html.includes('eval(function(p,a,c,k,e,d)')) {
    cleanHtml = unpackDeanEdwards(html);
  }

  // 1. Obfuscated joined array pattern: ["h","t","t","p","s", ...].join("")
  const arrayMatches = cleanHtml.match(/\[\s*["']h["']\s*,\s*["']t["']\s*,\s*["']t["']\s*,\s*["']p["'][\s\S]*?\]\.join\(\s*["']\s*["']\s*\)/gi);
  if (arrayMatches) {
    for (const raw of arrayMatches) {
      try {
        const arrayStr = raw.replace(/\.join\([\s\S]*?\)/, '').trim();
        const chars = eval(arrayStr);
        if (Array.isArray(chars)) {
          const joined = chars.join('');
          if (joined.includes('.m3u8')) {
            return joined;
          }
        }
      } catch (_) {}
    }
  }

  // 2. Direct .m3u8 playlist regex match
  const directMatch = cleanHtml.match(/(https?:\/\/[^"'\s<>\\]+?\.m3u8(?:\?[^"'\s<>\\]+)?)/i);
  if (directMatch) {
    return directMatch[1];
  }

  // 3. Base64 encoded URL match (aHR0cHM6 = https://, aHR0cDov = http://)
  const base64Matches = cleanHtml.match(/(?:atob\(['"]|['"])(aHR0c[A-Za-z0-9+/=]+)['"]/g);
  if (base64Matches) {
    for (const b of base64Matches) {
      try {
        const rawB64 = b.replace(/^(atob\(['"]|['"])|['"]$/g, '');
        const decoded = Buffer.from(rawB64, 'base64').toString('utf-8');
        if (decoded.includes('.m3u8')) {
          const m3u8Match = decoded.match(/(https?:\/\/[^"'\s<>\\]+?\.m3u8(?:\?[^"'\s<>\\]+)?)/i);
          if (m3u8Match) return m3u8Match[1];
        }
      } catch (_) {}
    }
  }

  // 4. Video chunk (.ts) match -> Reconstruct into master/playlist .m3u8
  const chunkMatch = cleanHtml.match(/(https?:\/\/[^"'\s<>\\]+?\/hls\/[^"'\s<>\\]+?)-[0-9]+\.ts(\?[^"'\s<>\\]+)?/i);
  if (chunkMatch) {
    return `${chunkMatch[1]}.m3u8${chunkMatch[2] || ''}`;
  }

  return null;
}

// Find embedded iframe if present
function findEmbeddedIframe(html) {
  const match = html.match(/<iframe[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  return match ? match[1] : null;
}

// ================= BROWSERLESS FETCHER =================

const puppeteer = require('puppeteer-core');

async function fetchWithBrowserless(targetUrl) {
  if (
    !BROWSERLESS_TOKEN ||
    BROWSERLESS_TOKEN === "YOUR_BROWSERLESS_TOKEN_HERE"
  ) {
    throw new Error(
      "Browserless token not configured. Please set BROWSERLESS_TOKEN."
    );
  }

  let browser = null;

  try {
    console.log(`🌐 [Browserless] Opening: ${targetUrl}`);

    browser = await puppeteer.connect({
      browserWSEndpoint: BROWSERLESS_WS_ENDPOINT
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/130.0.0.0 Safari/537.36'
    );

    // Images/fonts/media are not needed for M3U8 extraction.
    // JavaScript, XHR/fetch and document resources remain enabled.
    await page.setRequestInterception(true);

    page.on('request', request => {
      const resourceType = request.resourceType();

      if (
        resourceType === 'image' ||
        resourceType === 'font' ||
        resourceType === 'media'
      ) {
        request.abort().catch(() => {});
      } else {
        request.continue().catch(() => {});
      }
    });

    const response = await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    const initialStatus = response ? response.status() : 0;

    console.log(
      `📄 [Browserless] Initial HTTP Status: ${initialStatus}`
    );

    // Give normal browser-side JavaScript/navigation time to finish.
    // This does NOT attempt to solve or bypass any security challenge.
    await new Promise(resolve => setTimeout(resolve, 10000));

    const title = await page.title().catch(() => 'No title');
    const currentUrl = page.url();

    // Capture any M3U8 URL that is exposed through normal page requests.
    const observedM3u8 = new Set();

    const requestListener = request => {
      try {
        const url = request.url();
        if (/\\.m3u8(?:[?#]|$)/i.test(url)) {
          observedM3u8.add(url);
        }
      } catch (_) {}
    };

    page.on('request', requestListener);

    // Give the page a short additional window to make normal requests.
    await new Promise(resolve => setTimeout(resolve, 3000));

    page.off('request', requestListener);

    const html = await page.content();

    console.log(
      `📄 [Browserless] Final Status: ${initialStatus} | ` +
      `Title: "${title}" | HTML Length: ${html.length}`
    );

    console.log(`📍 [Browserless] Final URL: ${currentUrl}`);

    if (observedM3u8.size > 0) {
      console.log(
        `🎯 [Browserless] Observed ${observedM3u8.size} M3U8 request(s).`
      );
    }

    // Return the final DOM to the existing extractor.
    // A 403 is not rejected here because the browser may have navigated
    // after the initial response. If it remains a challenge page,
    // extraction will simply report that no M3U8 was found.
    if (!html || html.length < 100) {
      throw new Error(
        `Browserless returned an empty/very small page (${html.length} bytes)`
      );
    }

    // Attach observed URLs without changing the existing extractor API.
    if (observedM3u8.size > 0) {
      return `${html}\\n<!-- BROWSERLESS_OBSERVED_M3U8\\n${[
        ...observedM3u8
      ].join('\\n')}\\n-->`;
    }

    return html;

  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (_) {}
    }
  }
}

// ================= FETCH DISPATCHER =================

async function fetchPageHtml(targetUrl) {
  return await fetchWithBrowserless(targetUrl);
}

// ================= SUPABASE SYNC (PATCH / INSERT) =================

async function updateChannelInSupabase(channel, newStreamUrl) {
  try {
    const patchUrl = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${channel.id}`;

    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        stream_url: newStreamUrl,
        referer: channel.referer || 'https://playsza.xyz/'
      })
    });

    const patchData = await patchRes.json().catch(() => []);

    if (patchRes.ok && Array.isArray(patchData) && patchData.length > 0) {
      console.log(`✅ [Supabase] Updated '${channel.id}' (${channel.name}) stream_url successfully!`);
      return;
    }

    console.log(`ℹ️ [Supabase] Row '${channel.id}' not found. Creating fresh row...`);
    const insertUrl = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}`;
    const insertRes = await fetch(insertUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: channel.id,
        title: channel.name,
        stream_url: newStreamUrl,
        referer: channel.referer || 'https://playsza.xyz/',
        poster_url: channel.poster_url || 'https://crichd.mobile/assets/channels/willow.webp',
        category: channel.category || 'Cricket',
        language: channel.language || 'Hindi',
        quality: '1080p HD',
        plot: `Live ${channel.name} Stream`,
        is_active: true,
        sort_order: 1
      })
    });

    if (insertRes.ok) {
      console.log(`✅ [Supabase] Inserted new row for '${channel.id}' (${channel.name})!`);
    } else {
      console.error(`❌ [Supabase Error]:`, await insertRes.text());
    }

  } catch (err) {
    console.error(`❌ [Supabase Network Error]:`, err.message);
  }
}

// ================= WORKER CYCLE =================

async function runCycle() {
  const hasBrowserless =
    BROWSERLESS_TOKEN &&
    BROWSERLESS_TOKEN !== "YOUR_BROWSERLESS_TOKEN_HERE";

  const activeEngine = hasBrowserless
    ? "Browserless Puppeteer"
    : "None";

  console.log(`\n====================================================`);
  console.log(`   HTTP STREAM TOKEN SCRAPER (CYCLE: ${new Date().toLocaleTimeString()})   `);
  console.log(`   Engine: ${activeEngine}`);
  console.log(`====================================================`);

  if (!hasBrowserless) {
    console.error("❌ Browserless token not configured!");
    console.error(
      "👉 Please open http-streams.js and replace 'YOUR_BROWSERLESS_TOKEN_HERE' with your actual Browserless token."
    );
    return;
  }

  for (const ch of CHANNELS_TO_UPDATE) {
    console.log(`\n>>> [${ch.name}] Fetching: ${ch.pageUrl}`);

    try {
      let html = await fetchPageHtml(ch.pageUrl);
      let streamUrl = extractM3u8FromHtml(html);

      // If direct stream not found, check for an embedded iframe.
      if (!streamUrl) {
        const iframeUrl = findEmbeddedIframe(html);

        if (iframeUrl && iframeUrl !== ch.pageUrl) {
          console.log(
            `👉 [${ch.id}] Found embedded iframe: ${iframeUrl}. Fetching inner frame...`
          );

          const iframeHtml = await fetchPageHtml(iframeUrl);
          streamUrl = extractM3u8FromHtml(iframeHtml);
        }
      }

      if (streamUrl) {
        console.log(
          `>>> [${ch.id}] 🎯 Captured M3U8 -> ${streamUrl.slice(0, 110)}...`
        );

        await updateChannelInSupabase(ch, streamUrl);
      } else {
        const pageTitleMatch = html.match(/<title>([^<]+)<\/title>/i);
        const pageTitle = pageTitleMatch
          ? pageTitleMatch[1]
          : 'No title';

        console.error(
          `⚠️ [${ch.name}] Could not extract M3U8 ` +
          `(HTML Length: ${html.length}, Title: "${pageTitle}").`
        );

        if (html.length < 500) {
          console.log(`ℹ️ [Debug Preview]:`, html.trim());
        }
      }

    } catch (err) {
      console.error(
        `❌ [${ch.name}] Error during extraction:`,
        err.message
      );
    }

    // Brief delay between channels.
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(
    `\n>>> Cycle completed. Next run in ${REFRESH_INTERVAL_MINUTES} minutes.`
  );
}

// 1. Run immediately
runCycle();

// 2. Schedule every N minutes
setInterval(runCycle, REFRESH_INTERVAL_MINUTES * 60 * 1000);
