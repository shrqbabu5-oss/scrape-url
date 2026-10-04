// ================= CONFIGURATION =================

// 👉 APNI BROWSERLESS API KEY YAHA DAALEIN (Fastest Cloud Browser):
const BROWSERLESS_API_KEY = "2VNbTximwc4XYKC15c29aeecd697096c6785cca3e5ca4aaf4";

// 👉 APNI ZENROWS API KEY YAHA DAALEIN (Fallback):
const ZENROWS_API_KEY = "YOUR_ZENROWS_API_KEY_HERE";

// 👉 APNI SCRAPINGANT API KEY (Optional Fallback):
const SCRAPINGANT_API_KEY = "";

const SUPABASE_URL = "https://exaorbbpvxnogpbvyayx.supabase.co"; // Replace with your actual Supabase URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW9yYmJwdnhub2dwYnZ5YXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjM4MDUsImV4cCI6MjEwNDY5OTgwNX0.mnV03xUfYtG5xFftaNNnkK_S7UkIGPLw5QTqcIf6aWs"; // Replace with your actual Supabase Key
const TABLE_NAME = "live_channels";

const CHANNELS_TO_UPDATE = [
  {
    id: "starsp4",
    name: "Star Sports 1 (Hi)",
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
    pageUrl: "https://playsza.xyz/uembed.php?v=sony1c",
    referer: "https://playsza.xyz/",
    language: "English",
    category: "Sports"
  },
  {
    id: "starsp2",
    name: "Star Sports 2 (Hi)",
    pageUrl: "https://playsza.xyz/uembed.php?v=star3in",
    referer: "https://playsza.xyz/",
    language: "Hindi",
    category: "Cricket"
  }
];

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

// ================= BROWSERLESS BQL FETCHER =================

async function fetchWithBrowserless(targetUrl) {
  const endpoint = "https://production-sfo.browserless.io/chromium/bql";
  const proxyString = "&proxy=residential&proxySticky=true&proxyCountry=in";
  const optionsString = "&humanlike=true&blockAds=true&blockConsentModals=true";

  const url = `${endpoint}?token=${BROWSERLESS_API_KEY}${proxyString}${optionsString}`;

  // Native GraphQL Query matching your working IDE example
  const query = `
    mutation ScrapeStreams {
      # 1. Provide a realistic browser viewport
      viewport(width: 1366, height: 768) {
        width
        height
      }

      # 2. Setup the proxy for this session
      proxy(type: [document, xhr], country: IN, sticky: true) {
        time
      }

      # 3. Load the Streaming URL and wait for initial load
      goto(url: "${targetUrl}", waitUntil: networkIdle) {
        status
      }

      # 4. Wait 12 seconds for Cloudflare Turnstile to auto-bypass and scripts to decode m3u8
      waitForTimeout(timeout: 12000)

      # 5. Extract the page HTML to be parsed by our regex matching logic
      content {
        html
      }
    }
  `;

  console.log('   [Wait] Sending BrowserQL mutation and waiting for execution...');

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      operationName: 'ScrapeStreams'
    })
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Browserless HTTP Error (${response.status}): ${errText.slice(0, 150)}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`BrowserQL Execution Errors: ${JSON.stringify(data.errors)}`);
  }

  if (data.data && data.data.content && data.data.content.html) {
    return data.data.content.html;
  }

  throw new Error('Browserless returned empty HTML content.');
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

  console.log(`\n====================================================`);
  console.log(`   Scrape Run Finished Successfully ✅     `);
  console.log(`====================================================`);
}

// Ensure the script exits properly after one full run (since GitHub Actions cron handles the schedule)
runCycle().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
