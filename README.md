# ⚡ Landing Page Cloner Engine (Light Neo-Brutalism Edition)

An automated engine to clone and generate a **1-File Standalone `index.html`** (bundling HTML, CSS, and JS) from any landing page. Now equipped with a **Headless Puppeteer Engine** to support modern frameworks (**Next.js, React.js, Astro.js, Vue, Webflow, Shopify**) as well as standard platforms (**Scalev, Berdu, WordPress, Elementor**).

Every time a new landing page is cloned, the system creates an isolated subfolder containing clean code, stripped of old tracking scripts, with external CSS auto-inlined and relative asset paths resolved, ready to be hosted or used on the Scalev platform.

---

## 🚀 Dual Engine Support

1. **🚀 Dynamic Engine (Puppeteer)** *(Recommended & Default)*:
   - Launches headless Chromium (using existing Chrome/Edge on system).
   - Fully executes and renders JavaScript (*hydration* for Next.js, React, Astro, Vue).
   - Auto-scrolls page to trigger lazy-loaded images (`next/image`, `loading="lazy"`).
   - Scans and inlines all external stylesheets (`<link rel="stylesheet">`).
   - Resolves all relative media & asset paths (`/images/...`, `/_next/...`) to absolute URLs.

2. **⚡ Fast Static Engine (Fetch)**:
   - Ultra-fast zero-dependency HTTP GET fetch.
   - Ideal for standard Scalev landing pages and simple static HTML.

---

## 💻 How to Run the Engine

### Method 1: Via the Visual Web Dashboard (Light Neo-Brutalism)
1. Open a terminal in the `Landing Page/` folder.
2. Run:
   ```bash
   npm start
   ```
   *(or `node server.js`)*
3. Your default browser will **automatically open** at:
   👉 **http://localhost:3333**
4. Enter target URL, Project Name, and choose the **Cloner Engine Mode**.
5. Click **⚡ CLONE NOW**.
6. Monitor the **Live Process Terminal**, preview the page (Desktop / Mobile 375px switcher), or open the project folder in File Explorer.

---

### Method 2: Via Terminal CLI

- **Direct Argument Mode**:
  ```bash
  node clone.js <TARGET_URL> <PROJECT_NAME> [CTA_PLACEHOLDER] [MODE]
  ```
  *Examples:*
  ```bash
  # Default Puppeteer mode (Next.js / React / Astro)
  node clone.js https://example-nextjs.com MyNextProject

  # Fast Static mode
  node clone.js https://tdwresources.myscalev.com/fr3days TDW --fast
  ```

- **Interactive Q&A Mode**:
  ```bash
  node clone.js
  ```
  Follow the on-screen prompts step by step.

---

## 📁 Directory Structure & Architecture

```
Landing Page/
├── package.json              # npm start, serve, clone scripts
├── server.js                 # Local web server (Port 3333) + REST API + Auto-open
├── clone.js                  # Interactive & CLI runner
├── engine/
│   └── cloner.js             # Puppeteer headless engine, CSS inlining & asset resolving
├── public/
│   ├── index.html            # Web Dashboard in Light Neo-Brutalism style
│   └── app.js                # Frontend controller & live preview modal
├── README.md                 # Project documentation
│
└── projects/                 # Destination folder for all landing page projects
    └── <Project_Name>/       # Isolated project folder
        ├── index.html        # 100% standalone cloned landing page
        ├── SCALEV_GUIDE.md   # Scalev customization guide
        └── raw_source.html   # Raw backup of source page
```
