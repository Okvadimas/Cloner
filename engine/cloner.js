/**
 * Core Landing Page Cloner Engine
 * Supports:
 * 1. Dynamic Mode (Puppeteer Headless Browser) - Next.js, React, Astro, Vue, Webflow, Shopify
 * 2. Fast Static Mode (Zero-Dependency HTTP) - Scalev & standard HTML pages
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

// Helper to find installed Chrome / Edge on Windows or common systems
function getBrowserPath() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ].filter(Boolean);

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (e) {}
  }
  return null;
}

// Helper to resolve relative URLs inside CSS content against the stylesheet's URL
function resolveCssUrls(cssText, baseUrl) {
  if (!cssText) return '';
  return cssText.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (match, quote, assetUrl) => {
    const clean = assetUrl.trim();
    if (!clean || clean.startsWith('data:') || clean.startsWith('blob:') || clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('//')) {
      return match;
    }
    try {
      const resolved = new URL(clean, baseUrl).href;
      return `url("${resolved}")`;
    } catch (e) {
      return match;
    }
  });
}

// Helper to download an external CSS file and resolve internal URLs
async function fetchCss(cssUrl) {
  try {
    const response = await fetch(cssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/css,*/*;q=0.1'
      }
    });
    if (response.ok) {
      const text = await response.text();
      return resolveCssUrls(text, cssUrl);
    }
  } catch (err) {
    // Fail silently for individual CSS files
  }
  return '';
}

// Helper to download web content using plain HTTP (Fast mode fallback)
async function fetchPage(targetUrl) {
  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download page (HTTP ${response.status}: ${response.statusText})`);
  }
  
  return await response.text();
}

// Helper to render dynamic page via Puppeteer (Handles Next.js, React, Astro, Vue)
async function renderPageWithPuppeteer({ url, onLog }) {
  const browserPath = getBrowserPath();
  if (!browserPath) {
    throw new Error('No Google Chrome or Microsoft Edge installation detected on system. Please install Chrome or switch to Fast Static Mode.');
  }

  onLog(`Launching Headless Chromium (${path.basename(browserPath)})...`, 'step');
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36');

    // Anti-bot detection stealth evasion (Bypasses Cloudflare Turnstile & Next.js bot barriers)
    await page.evaluateOnNewDocument(() => {
      delete navigator.__proto__.webdriver;
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
    });

    onLog('Opening page & waiting for JavaScript hydration...', 'step');
    try {
      await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 45000 });
    } catch (e) {
      onLog('Network busy/streaming detected, continuing with current DOM state...', 'info');
    }

    onLog('Triggering auto-scroll to activate lazy-loaded images & assets...', 'step');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight || totalHeight > 16000) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 70);
      });
    });

    // Small pause for lazy components / layout settle
    await new Promise(r => setTimeout(r, 1000));

    // Extract external stylesheet URLs
    onLog('Scanning external stylesheets (<link rel="stylesheet">)...', 'step');
    const stylesheetUrls = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(l => l.href)
        .filter(href => href && !href.startsWith('chrome-extension://') && !href.includes('fonts.googleapis.com'));
    });
    onLog(`Found ${stylesheetUrls.length} external stylesheet(s)`, 'info');

    // Resolve relative asset URLs directly inside the DOM before extracting
    onLog('Resolving relative media & image paths to absolute URLs...', 'step');
    await page.evaluate(() => {
      const baseUrl = window.location.href;

      // 1. Resolve img, video, audio, source, iframe, embed
      document.querySelectorAll('img, video, audio, source, iframe, embed, track').forEach(el => {
        const src = el.getAttribute('src');
        if (src && !src.startsWith('data:') && !src.startsWith('blob:') && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//')) {
          try { el.setAttribute('src', new URL(src, baseUrl).href); } catch (e) {}
        }

        // Check common lazyload / responsive attributes
        ['data-src', 'data-original', 'data-lazy-src', 'srcset', 'data-srcset'].forEach(attr => {
          const val = el.getAttribute(attr);
          if (val) {
            if (attr === 'srcset' || attr === 'data-srcset') {
              const updated = val.split(',').map(part => {
                const trimmed = part.trim();
                const spaceIdx = trimmed.indexOf(' ');
                if (spaceIdx === -1) {
                  try { return new URL(trimmed, baseUrl).href; } catch (e) { return trimmed; }
                }
                const u = trimmed.slice(0, spaceIdx);
                const desc = trimmed.slice(spaceIdx);
                try { return new URL(u, baseUrl).href + desc; } catch (e) { return trimmed; }
              }).join(', ');
              el.setAttribute(attr, updated);
            } else if (!val.startsWith('data:') && !val.startsWith('http://') && !val.startsWith('https://')) {
              try { el.setAttribute(attr, new URL(val, baseUrl).href); } catch (e) {}
            }
          }
        });
      });

      // 2. Resolve inline background-image url()
      document.querySelectorAll('[style*="url("]').forEach(el => {
        const style = el.getAttribute('style');
        if (!style) return;
        const updated = style.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi, (match, path) => {
          if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('//')) return match;
          try {
            return `url("${new URL(path, baseUrl).href}")`;
          } catch (e) {
            return match;
          }
        });
        el.setAttribute('style', updated);
      });

      // 3. Resolve relative href links on <a> tags (so internal navigation doesn't 404 on localhost)
      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//')) {
            try { a.setAttribute('href', new URL(href, baseUrl).href); } catch (e) {}
          }
        }
      });

      // 4. Reveal all scroll-animated elements (AOS, WOW, Sal, ScrollReveal, Tailwind entrance)
      document.querySelectorAll('[data-aos], [data-sal], .wow, [data-sr-id]').forEach(el => {
        el.classList.add('aos-animate');
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.visibility = 'visible';
      });

      // Remove Tailwind / React entrance animation classes that hide elements on static pages
      document.querySelectorAll('.opacity-0').forEach(el => {
        const cl = el.className || '';
        if (typeof cl === 'string' && (cl.includes('translate-y') || cl.includes('translate-x') || cl.includes('transition'))) {
          el.classList.remove('opacity-0');
          el.classList.add('opacity-100');
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });

      // Reveal Apple & modern video scrubber fallback pictures (InlineMedia)
      document.querySelectorAll('[data-component-list~="InlineMedia"]').forEach(wrapper => {
        const staticPic = wrapper.querySelector('picture.static');
        if (staticPic) {
          staticPic.style.display = 'block';
          staticPic.style.visibility = 'visible';
          staticPic.style.opacity = '1';
        }
        const mediaWrapper = wrapper.querySelector('.inline-media-wrapper');
        if (mediaWrapper) {
          mediaWrapper.style.display = 'none';
        }
      });

      // Remove fixed backdrop-blur overlays and intrusive cookie popups
      document.querySelectorAll('div[class*="backdrop-blur-[50px]"], div[class*="nav-desktop:backdrop-blur"], div[class*="duration-sidebar"], div[class*="bg-secondary-60"][class*="fixed"], div[class*="z-52"][class*="fixed"]').forEach(el => el.remove());

      // 5. Clean third-party trackers, pixel scripts, and injected popups
      document.querySelectorAll('script').forEach(s => {
        const src = s.src || '';
        const content = s.textContent || '';
        const isTracker = /facebook\.net|connect\.facebook|googletagmanager|analytics\.js|google-analytics|gtag\/js|hotjar|tiktok\.com|clarity\.ms|contentsquare\.net/i.test(src) ||
                          /fbq\(|gtag\(|clarity\(|tiktok\.track/i.test(content);
        if (isTracker) {
          s.remove();
        }
      });
      document.querySelectorAll('noscript, iframe[src*="googletagmanager"]').forEach(el => el.remove());
    });

    const renderedHtml = await page.content();
    await browser.close();

    return {
      html: renderedHtml,
      stylesheetUrls
    };

  } catch (err) {
    await browser.close().catch(() => {});
    throw err;
  }
}

/**
 * Main Clone Function
 * @param {Object} options
 * @param {string} options.url - Target URL to clone
 * @param {string} options.projectName - Destination folder name
 * @param {string} options.ctaUrl - Custom checkout URL placeholder
 * @param {string} options.mode - 'puppeteer' | 'fast'
 * @param {Function} options.onLog - Progress callback function(msg, type)
 */
async function cloneLandingPage({ url, projectName, ctaUrl, mode = 'puppeteer', onLog = console.log }) {
  const log = (msg, type = 'info') => onLog(msg, type);

  // Validate Project Name
  const safeName = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  if (!safeName) throw new Error('Project name cannot be empty!');
  
  const rootPath = path.resolve(__dirname, '..');
  const projectsDir = path.join(rootPath, 'projects');
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }
  const projectPath = path.join(projectsDir, safeName);
  
  log(`Starting clone process for project: ${safeName}`, 'step');
  log(`Target URL: ${url}`, 'info');
  log(`Selected Engine: ${mode === 'puppeteer' ? '🚀 Dynamic Headless Browser (Puppeteer)' : '⚡ Fast Static Mode (HTTP)'}`, 'info');
  
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
    log(`Destination folder created: projects/${safeName}`, 'info');
  }

  let rawHtml = '';
  let externalCssRules = '';

  // 1. FETCH / RENDER HTML
  if (mode === 'puppeteer') {
    try {
      const renderResult = await renderPageWithPuppeteer({ url, onLog: log });
      rawHtml = renderResult.html;
      log(`Successfully captured rendered DOM (${rawHtml.length.toLocaleString()} bytes)`, 'success');

      // Download external stylesheets (Next.js / Astro / Tailwind / Webflow)
      if (renderResult.stylesheetUrls && renderResult.stylesheetUrls.length > 0) {
        log(`Downloading and inlining ${renderResult.stylesheetUrls.length} external stylesheet(s)...`, 'step');
        for (const cssUrl of renderResult.stylesheetUrls) {
          try {
            const css = await fetchCss(cssUrl);
            if (css) {
              externalCssRules += `\n/* Inlined from: ${cssUrl} */\n${css}\n`;
            }
          } catch (e) {
            log(`Notice: Could not load CSS from ${cssUrl}`, 'info');
          }
        }
        log(`External stylesheets bundled (${externalCssRules.length.toLocaleString()} characters)`, 'success');
      }

    } catch (err) {
      log(`Puppeteer dynamic engine warning: ${err.message}`, 'error');
      log('Automatically falling back to Fast Static Mode (HTTP Fetch)...', 'info');
      rawHtml = await fetchPage(url);
    }
  } else {
    log('Downloading source page content via HTTP GET...', 'step');
    rawHtml = await fetchPage(url);
    log(`Downloaded static page (${rawHtml.length.toLocaleString()} bytes)`, 'success');
  }

  // Save raw backup
  fs.writeFileSync(path.join(projectPath, 'raw_source.html'), rawHtml, 'utf8');
  log('Source backup file saved to raw_source.html', 'info');

  // 2. DETECT PLATFORM & EXTRACT
  const isScalev = rawHtml.includes('scalev-html-mode-root') || 
                  rawHtml.includes('myscalev.com') || 
                  rawHtml.includes('scalev-runtime');

  let title = 'Landing Page';
  const titleMatch = rawHtml.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) title = titleMatch[1].trim();

  let metaDesc = '';
  const descMatch = rawHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (descMatch) metaDesc = descMatch[1].trim();

  let bodyContent = '';
  let inlineCssRules = '';
  let jsScripts = '';

  if (isScalev && rawHtml.includes('scalev-html-mode-root')) {
    log('Detection: Scalev platform identified!', 'success');
    
    // Extract Scalev Body
    const rootStart = rawHtml.indexOf('<div id="scalev-html-mode-root">');
    let rootEnd = rawHtml.indexOf('<script id="scalev-data"');
    if (rootEnd === -1) rootEnd = rawHtml.indexOf('<script id="scalev-runtime"');
    if (rootEnd === -1) rootEnd = rawHtml.lastIndexOf('</div>');
    const closingDiv = rawHtml.lastIndexOf('</div>', rootEnd);
    
    bodyContent = rawHtml.slice(rootStart, closingDiv + 6);
    log(`Scalev body extraction complete (${bodyContent.length.toLocaleString()} characters)`, 'info');

    // Extract Styles
    const styleMatches = rawHtml.match(/<style[\s\S]*?<\/style>/gi) || [];
    styleMatches.forEach((s) => {
      const cleanS = s.replace(/^<style[^>]*>/i, '').replace(/<\/style>$/i, '').trim();
      if (!cleanS.includes('--sclv') && cleanS.length > 500) {
        inlineCssRules += cleanS + '\n';
      }
    });

    // Extract Custom JS (countdown timer & youtube facade)
    const customJsMatch = rawHtml.match(/<script id="scalev-html-mode-js"[^>]*>([\s\S]*?)<\/script>/i);
    if (customJsMatch) {
      jsScripts = customJsMatch[1].trim();
      log('Scalev interactive script extraction complete', 'info');
    }

  } else {
    log('Detection: Universal / Modern Framework Page (Next.js / React / Astro / Webflow)', 'info');
    
    // Universal body extraction
    const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    bodyContent = bodyMatch ? bodyMatch[1] : rawHtml;

    // Remove tracking scripts from body
    bodyContent = bodyContent.replace(/<script[^>]*>(?:(?!<\/script>)[\s\S])*?(?:facebook\.net|googletagmanager|analytics|pixel|hotjar|tiktok|clarity)[\s\S]*?<\/script>/gi, '');

    // Extract inline styles
    const styles = rawHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    styles.forEach((s) => {
      const c = s.replace(/^<style[^>]*>/i, '').replace(/<\/style>$/i, '').trim();
      inlineCssRules += c + '\n';
    });
  }

  // 3. ASSEMBLE COMBINED CSS
  log('Organizing styles & optimizing code structure...', 'step');
  const scrollAnimationFix = `
  /* Auto-reveal scroll animations (AOS, WOW, Sal, ScrollReveal) */
  [data-aos], [data-sal], .wow, [data-sr-id] {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
    transition: none !important;
  }
  .aos-animate {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
  }
  /* Modern Tailwind / React entrance animation reveal */
  .opacity-0.translate-y-6,
  .opacity-0.translate-y-4,
  .opacity-0.translate-y-8,
  .opacity-0.translate-y-2,
  .opacity-0.translate-y-10,
  .opacity-0.translate-y-12,
  .opacity-0.-translate-y-6,
  .opacity-0.translate-x-6,
  .opacity-0.-translate-x-6 {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
  }

  /* Reveal Apple InlineMedia static fallback pictures */
  [data-component-list~=InlineMedia] .inline-media-wrapper + .static,
  [data-component-list~=InlineMedia] picture.static,
  picture.static {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  [data-component-list~=InlineMedia] .inline-media-wrapper {
    display: none !important;
  }
  .tile-image-wrapper {
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* Remove fixed mega-menu backdrop-blur overlays that cover screens */
  div[class*="backdrop-blur-[50px]"],
  div[class*="nav-desktop:backdrop-blur"],
  div[class*="duration-sidebar"],
  div[class*="bg-secondary-60"][class*="fixed"] {
    display: none !important;
  }

  /* Ensure hero canvas / video backdrops remain fully visible */
  [data-astra-backdrop],
  [data-astra-scene],
  div:has(> video[data-cloned-canvas-video]),
  div:has(> [data-astra-scene]) {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* Hide intrusive fixed cookie banners */
  div[class*="z-52"][class*="fixed"],
  div[id*="cookie-banner"],
  div[class*="cookie-banner"] {
    display: none !important;
  }
  `;
  const combinedCss = (scrollAnimationFix + '\n' + externalCssRules + '\n' + inlineCssRules).trim();
  const finalCss = combinedCss.length > 0 ? combinedCss : '/* Base fallback */\nbody { font-family: sans-serif; line-height: 1.6; margin: 0; padding: 0; }';

  // 4. REPLACE CTA LINKS
  const targetCta = ctaUrl && ctaUrl.trim() ? ctaUrl.trim() : 'https://yourstore.myscalev.com/your-checkout';
  const ctaRegex = /href=["'](https?:\/\/[^"']*(?:checkout|order|cp-|beli|wa\.me|api\.whatsapp\.com)[^"']*)["']/gi;
  const oldLinks = bodyContent.match(ctaRegex) || [];
  if (oldLinks.length > 0) {
    oldLinks.forEach((link) => {
      const rawHref = (link.match(/href=["']([^"']*)["']/) || [])[1];
      if (rawHref) {
        bodyContent = bodyContent.split(rawHref).join(targetCta);
      }
    });
    log(`Replaced ${oldLinks.length} CTA link(s) with placeholder: ${targetCta}`, 'success');
  }

  // Fallback JS if none found
  if (!jsScripts) {
    jsScripts = `
    // Auto Click-to-load YouTube facade if present
    document.querySelectorAll('.video-embed[data-yt]').forEach(function(el){
      el.addEventListener('click', function(){
        if(el.classList.contains('played')) return;
        el.classList.add('played');
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube.com/embed/' + el.getAttribute('data-yt') + '?autoplay=1&rel=0';
        f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
        f.setAttribute('allowfullscreen', '');
        f.setAttribute('frameborder', '0');
        el.appendChild(f);
      });
    });
    `;
  }

  // Extract html tag attributes (e.g. class="dark", dir="ltr", data-theme, etc.)
  const htmlTagMatch = rawHtml.match(/<html([^>]*)>/i);
  let htmlAttrs = htmlTagMatch ? htmlTagMatch[1].trim() : 'lang="id"';
  if (!/lang=/i.test(htmlAttrs)) {
    htmlAttrs = `lang="id" ${htmlAttrs}`.trim();
  }

  // Extract body tag attributes (e.g. class="...", style="...", etc.)
  const bodyTagMatch = rawHtml.match(/<body([^>]*)>/i);
  let bodyAttrs = bodyTagMatch ? bodyTagMatch[1].trim() : '';

  // 5. ASSEMBLE STANDALONE INDEX.HTML
  log('Assembling 1 standalone index.html file...', 'step');
  const finalHtml = `<!DOCTYPE html>
<html ${htmlAttrs}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${metaDesc ? `<meta name="description" content="${metaDesc}">` : ''}
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
${finalCss}
  </style>
</head>
<body${bodyAttrs ? ' ' + bodyAttrs : ''}>

${bodyContent}

  <!-- Interactive Scripts -->
  <script>
${jsScripts}
  </script>
</body>
</html>`;

  const indexFile = path.join(projectPath, 'index.html');
  fs.writeFileSync(indexFile, finalHtml, 'utf8');
  log(`Successfully created index.html (${finalHtml.length.toLocaleString()} bytes)`, 'success');

  // 6. GENERATE PROJECT GUIDE
  const guideContent = `# Landing Page Customization Guide (${safeName})

This landing page was generated as a 100% standalone file and is ready for use on **Scalev** or any web hosting.

---

## Project Summary
- **Project Name**: ${safeName}
- **Original Source URL**: ${url}
- **Engine Used**: ${mode === 'puppeteer' ? 'Dynamic Headless Browser (Puppeteer)' : 'Fast Static Mode (Fetch)'}
- **Placeholder Checkout Link**: \`${targetCta}\`
- **Primary File**: \`index.html\` (All HTML + CSS bundled into 1 file)

---

## How to Install into Scalev
1. Open your **Scalev** dashboard -> Navigate to **Pages**.
2. Create or select the page you want to update.
3. Switch to the **HTML Mode** / **Custom Code** tab.
4. Open \`index.html\` in a text editor, copy all code (**Ctrl + A**, then **Ctrl + C**).
5. Paste (**Ctrl + V**) into the Scalev editor, then click **Save & Publish**.

---

## Important Customization Points
1. **Checkout / Order Link**:
   Search with **Ctrl + F** inside the editor for:
   \`\`\`
   ${targetCta}
   \`\`\`
   Replace it with your Scalev checkout link.

2. **Images & Banners**:
   Replace \`src="..."\` attribute values on \`<img>\` tags with your new image URLs.

3. **Countdown Timer**:
   Look for date variables at the bottom script section to configure promo deadlines.
`;

  fs.writeFileSync(path.join(projectPath, 'SCALEV_GUIDE.md'), guideContent, 'utf8');
  log('Customization guide saved to SCALEV_GUIDE.md', 'success');

  log(`ALL PROCESSES COMPLETED! Project folder ready at: projects/${safeName}/`, 'finish');
  return {
    success: true,
    projectName: safeName,
    projectPath,
    indexFile,
    size: finalHtml.length,
    mode
  };
}

module.exports = { cloneLandingPage };
