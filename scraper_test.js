// ================= CONFIGURATION =================

// 👉 APNI BROWSERLESS API KEY YAHA DAALEIN (Fastest Cloud Browser):
const BROWSERLESS_API_KEY = "2VNbTximwc4XYKC15c29aeecd697096c6785cca3e5ca4aaf4";

// 👉 APNI ZENROWS API KEY YAHA DAALEIN (Fallback):
const ZENROWS_API_KEY = "YOUR_ZENROWS_API_KEY_HERE";

// 👉 APNI SCRAPINGANT API KEY (Optional Fallback):
const SCRAPINGANT_API_KEY = "";

const SUPABASE_URL = "https://eyyyyyyyyyyyyyyy.supabase.co"; // Replace with your actual Supabase URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR"; // Replace with your actual Supabase Key
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

  let cleanHtml = html;
  if (html.includes('eval(function(p,a,c,k,e,d)')) {
    cleanHtml = unpackDeanEdwards(html);
  }

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

  const directMatch = cleanHtml.match(/(https?:\/\/[^"'\s<>\\]+?\.m3u8(?:\?[^"'\s<>\\]+)?)/i);
  if (directMatch) {
    return directMatch[1];
  }

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

  const chunkMatch = cleanHtml.match(/(https?:\/\/[^"'\s<>\\]+?\/hls\/[^"'\s<>\\]+?)-[0-9]+\.ts(\?[^"'\s<>\\]+)?/i);
  if (chunkMatch) {
    return `${chunkMatch[1]}.m3u8${chunkMatch[2] || ''}`;
  }

  return null;
}

function findEmbeddedIframe(html) {
  const match = html.match(/<iframe[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  return match ? match[1] : null;
}

// ================= BROWSERLESS BAP SDK FETCHER =================

async function fetchWithBrowserless(targetUrl) {
  let browser = null;
  try {
    const bapModule = await import('@browserless.io/bap-ts');
    const Browserless = bapModule.default || bapModule;

    browser = Browserless.connect({
      browserWSEndpoint: "wss://production-sfo.browserless.io?token=${BROWSERLESS_API_KEY}&proxy=residential&proxySticky=true&proxyCountry=us&blockAds=true&humanlike=true",
    });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'Referer': 'https://playsza.xyz/' });
    await page.goto(targetUrl, { waitUntil: 'domContentLoaded', timeout: 30000 });

    console.log('   [Wait] Solving Cloudflare Turnstile...');
    for (let i = 0; i < 12; i++) {
        const title = await page.title().catch(() => '');
        if (!title.includes('Just a moment') && !title.includes('Attention Required')) {
            break;
        }

        // Attempt physical internal click via JS if challenge is stuck
        await page.evaluate(() => {
           const cf = document.querySelector('iframe[src*="cloudflare"], iframe[src*="turnstile"], #turnstile-wrapper');
           if (cf) cf.click();
        }).catch(() => {});

        await new Promise(r => setTimeout(r, 2000));
    }

    // Extra grace period for player scripts to decode the m3u8
    await new Promise(r => setTimeout(r, 4000));

    const html = await page.content();
    await browser.close();
    return html;
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    throw err;
  }
}

// ================= ZENROWS FETCHER =================

async function fetchWithZenRows(targetUrl) {
  const endpoint = new URL('https://api.zenrows.com/v1/');
  endpoint.searchParams.set('url', targetUrl);
  endpoint.searchParams.set('apikey', ZENROWS_API_KEY);
  endpoint.searchParams.set('js_render', 'true');
  endpoint.searchParams.set('antibot', 'true');
  endpoint.searchParams.set('premium_proxy', 'true');
  endpoint.searchParams.set('wait', '4000');
  endpoint.searchParams.set('custom_headers', 'true');

  const res = await fetch(endpoint.toString(), {
    headers: {
      'Referer': 'https://playsza.xyz/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`ZenRows API error (${res.status}): ${errText.slice(0, 150)}`);
  }

  return await res.text();
}

// ================= SCRAPINGANT FETCHER =================

async function fetchWithScrapingAnt(targetUrl) {
  const endpoint = new URL('https://api.scrapingant.com/v2/general');
  endpoint.searchParams.set('url', targetUrl);
  endpoint.searchParams.set('x-api-key', SCRAPINGANT_API_KEY);
  endpoint.searchParams.set('browser', 'true');
  endpoint.searchParams.set('return_page_source', 'true');

  const res = await fetch(endpoint.toString());

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`ScrapingAnt API error (${res.status}): ${errText.slice(0, 150)}`);
  }

  return await res.text();
}

// ================= FETCH DISPATCHER =================

async function fetchPageHtml(targetUrl) {
  const hasBrowserless = BROWSERLESS_API_KEY && BROWSERLESS_API_KEY !== "YOUR_BROWSERLESS_API_KEY_HERE";
  const hasZenrows = ZENROWS_API_KEY && ZENROWS_API_KEY !== "YOUR_ZENROWS_API_KEY_HERE";
  const hasScrapingAnt = SCRAPINGANT_API_KEY && SCRAPINGANT_API_KEY !== "";

  if (hasBrowserless) {
    return await fetchWithBrowserless(targetUrl);
  }
  if (hasZenrows) {
    return await fetchWithZenRows(targetUrl);
  }
  if (hasScrapingAnt) {
    return await fetchWithScrapingAnt(targetUrl);
  }
  throw new Error("No API key configured. Please set BROWSERLESS_API_KEY or ZENROWS_API_KEY at the top of the file.");
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
  const hasBrowserless = BROWSERLESS_API_KEY && BROWSERLESS_API_KEY !== "YOUR_BROWSERLESS_API_KEY_HERE";
  const hasZenrows = ZENROWS_API_KEY && ZENROWS_API_KEY !== "YOUR_ZENROWS_API_KEY_HERE";
  const hasScrapingAnt = SCRAPINGANT_API_KEY && SCRAPINGANT_API_KEY !== "";

  const activeEngine = hasBrowserless ? "Browserless BAP SDK (Stealth Cloud)" : (hasZenrows ? "ZenRows Antibot API" : (hasScrapingAnt ? "ScrapingAnt API" : "None"));

  console.log(`\n====================================================`);
  console.log(`   HTTP STREAM TOKEN SCRAPER (CYCLE: ${new Date().toLocaleTimeString()})   `);
  console.log(`   Engine: ${activeEngine}`);
  console.log(`====================================================`);

  if (!hasBrowserless && !hasZenrows && !hasScrapingAnt) {
    console.error("❌ No scraping API key configured!");
    console.error("👉 Please open http-streams.js and replace 'YOUR_*_API_KEY_HERE'.");
    return;
  }

  for (const ch of CHANNELS_TO_UPDATE) {
    console.log(`\n>>> [${ch.name}] Fetching: ${ch.pageUrl}`);
    try {
      let html = await fetchPageHtml(ch.pageUrl);
      let streamUrl = extractM3u8FromHtml(html);

      // If direct stream not found, check if an embedded iframe exists and fetch it
      if (!streamUrl) {
        const iframeUrl = findEmbeddedIframe(html);
        if (iframeUrl && iframeUrl !== ch.pageUrl) {
          console.log(`👉 [${ch.id}] Found embedded iframe: ${iframeUrl}. Fetching inner frame...`);
          const iframeHtml = await fetchPageHtml(iframeUrl);
          streamUrl = extractM3u8FromHtml(iframeHtml);
        }
      }

      if (streamUrl) {
        console.log(`>>> [${ch.id}] 🎯 Captured M3U8 -> ${streamUrl.slice(0, 110)}...`);
        await updateChannelInSupabase(ch, streamUrl);
      } else {
        const pageTitleMatch = html.match(/<title>([^<]+)<\/title>/i);
        const pageTitle = pageTitleMatch ? pageTitleMatch[1] : 'No title';
        console.error(`⚠️ [${ch.name}] Could not extract M3U8 (HTML Length: ${html.length}, Title: "${pageTitle}").`);
        if (html.length < 500) {
          console.log(`ℹ️ [Debug Preview]:`, html.trim());
        }
      }

    } catch (err) {
      console.error(`❌ [${ch.name}] Error during extraction:`, err.message);
    }

    // Brief delay between channels
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n>>> Cycle completed. Next run in ${REFRESH_INTERVAL_MINUTES} minutes.`);
}

// 1. Run immediately
runCycle();

// 2. Schedule every N minutes
setInterval(runCycle, REFRESH_INTERVAL_MINUTES * 60 * 1000);
