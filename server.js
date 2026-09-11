/**
 * Local Web Server & API for Landing Page Cloner Engine
 * Light Neo-Brutalism Dashboard
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { cloneLandingPage } = require('./engine/cloner');

const DEFAULT_PORT = 3333;
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');

if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4'
};

// Helper to list all project folders from projects/ directory
function getProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  const items = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  const projects = [];

  for (const item of items) {
    if (item.isDirectory()) {
      const folderPath = path.join(PROJECTS_DIR, item.name);
      const indexPath = path.join(folderPath, 'index.html');
      const hasGuide = fs.existsSync(path.join(folderPath, 'SCALEV_GUIDE.md')) || 
                       fs.existsSync(path.join(folderPath, 'PANDUAN_SCALEV.md'));
      const hasRaw = fs.existsSync(path.join(folderPath, 'raw_source.html')) || 
                     fs.existsSync(path.join(folderPath, 'raw_landing.html'));

      if (fs.existsSync(indexPath)) {
        const stats = fs.statSync(indexPath);
        projects.push({
          name: item.name,
          size: stats.size,
          lastModified: stats.mtime,
          hasGuide: hasGuide,
          hasRaw: hasRaw
        });
      }
    }
  }

  // Sort by newest modified
  return projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
}

// Request Handler
const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = reqUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Get projects
  if (pathname === '/api/projects' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, projects: getProjects() }));
    return;
  }

  // API: Clone landing page (Server-Sent Events / streaming or JSON)
  if (pathname === '/api/clone' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { url, projectName, ctaUrl, mode } = JSON.parse(body || '{}');
        
        if (!url || !projectName) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'URL and Project Name are required!' }));
          return;
        }

        const logs = [];
        const result = await cloneLandingPage({
          url,
          projectName,
          ctaUrl,
          mode: mode || 'puppeteer',
          onLog: (msg, type) => {
            logs.push({ msg, type, time: new Date().toLocaleTimeString('en-US') });
          }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, result, logs }));

      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }


  // API: Open project folder in File Explorer
  if (pathname === '/api/open-folder' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { folder } = JSON.parse(body || '{}');
      if (!folder) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Folder name is required' }));
        return;
      }
      const safeFolder = path.basename(folder);
      const targetDir = path.join(PROJECTS_DIR, safeFolder);
      exec(`explorer.exe "${targetDir}"`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // API: Delete project folder from disk
  if (pathname === '/api/delete-project' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { folder } = JSON.parse(body || '{}');
        if (!folder) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Folder name is required' }));
          return;
        }

        const safeFolder = path.basename(folder);
        let targetDir = path.join(PROJECTS_DIR, safeFolder);

        // Also check legacy path in ROOT_DIR if not found in PROJECTS_DIR
        if (!fs.existsSync(targetDir)) {
          const legacyDir = path.join(ROOT_DIR, safeFolder);
          if (fs.existsSync(legacyDir) && fs.existsSync(path.join(legacyDir, 'index.html'))) {
            targetDir = legacyDir;
          }
        }

        if (fs.existsSync(targetDir)) {
          fs.rmSync(targetDir, { recursive: true, force: true });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: `Project ${safeFolder} deleted successfully` }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Project folder not found' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // PREVIEW: Serve customer index.html from projects/
  if (pathname.startsWith('/preview/')) {
    const parts = pathname.replace('/preview/', '').split('/');
    const customer = decodeURIComponent(parts[0]);
    const file = parts.slice(1).join('/') || 'index.html';
    let filePath = path.join(PROJECTS_DIR, customer, file);

    // Fallback to ROOT_DIR if existing project was in root
    if (!fs.existsSync(filePath)) {
      const legacyPath = path.join(ROOT_DIR, customer, file);
      if (fs.existsSync(legacyPath)) {
        filePath = legacyPath;
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/html' });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Project page not found');
      return;
    }
  }

  // STATIC FILES (Dashboard)
  let staticFile = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  let fullPath = path.join(PUBLIC_DIR, staticFile);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
    fs.createReadStream(fullPath).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

// Start Server with auto-port fallback & auto-open browser
function startServer(port) {
  server.listen(port, () => {
    const localUrl = `http://localhost:${port}`;
    console.log('\x1b[1m\x1b[33m');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║       ⚡ LANDING PAGE CLONER ENGINE FOR SCALEV ⚡            ║');
    console.log('║            Light Neo-Brutalism Dashboard Ready               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`\x1b[0m\x1b[32m🚀 Dashboard running at : \x1b[1m${localUrl}\x1b[0m`);
    console.log('Press Ctrl+C to stop the server.\n');

    // Auto-open browser on Windows
    exec(`start ${localUrl}`, (err) => {
      if (err) console.log('[Info] Open browser manually at:', localUrl);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Port ${port} in use, trying port ${port + 1}...]`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);
