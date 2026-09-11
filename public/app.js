// Frontend Logic for Landing Page Cloner Engine
let allProjects = [];

// DOM Elements
const cloneForm = document.getElementById('cloneForm');
const targetUrlInput = document.getElementById('targetUrl');
const projectNameInput = document.getElementById('projectName');
const ctaUrlInput = document.getElementById('ctaUrl');
const btnSubmit = document.getElementById('btnSubmit');
const btnClearForm = document.getElementById('btnClearForm');
const terminalLog = document.getElementById('terminalLog');
const btnClearLog = document.getElementById('btnClearLog');
const projectsList = document.getElementById('projectsList');
const projectCount = document.getElementById('projectCount');
const searchProjects = document.getElementById('searchProjects');
const btnRefreshProjects = document.getElementById('btnRefreshProjects');
const refreshIcon = document.getElementById('refreshIcon');
const engineStatusBadge = document.getElementById('engineStatusBadge');
const statusBadge = document.getElementById('statusBadge');

// Delete Modal DOM Elements
const deleteModal = document.getElementById('deleteModal');
const deleteProjectTargetName = document.getElementById('deleteProjectTargetName');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
let projectToDelete = null;

// Dynamic Status Controller
function setEngineStatus(state, text) {
  if (!engineStatusBadge || !statusBadge) return;
  engineStatusBadge.classList.remove('processing', 'error', 'success');

  if (state === 'processing') {
    engineStatusBadge.classList.add('processing');
    statusBadge.textContent = text || 'Downloading & Processing...';
  } else if (state === 'error') {
    engineStatusBadge.classList.add('error');
    statusBadge.textContent = text || 'Clone Failed';
    setTimeout(() => setEngineStatus('ready'), 4000);
  } else if (state === 'success') {
    engineStatusBadge.classList.add('success');
    statusBadge.textContent = text || 'Clone Successful!';
    setTimeout(() => setEngineStatus('ready'), 3500);
  } else {
    engineStatusBadge.classList.add('success');
    statusBadge.textContent = 'Engine Ready';
  }
}

// Preview Modal
const previewModal = document.getElementById('previewModal');
const previewFrame = document.getElementById('previewFrame');
const previewTitle = document.getElementById('previewTitle');
const btnOpenNewTab = document.getElementById('btnOpenNewTab');

// Log Appender
function appendLog(message, type = 'info') {
  const line = document.createElement('div');
  line.className = 'terminal-line ' + type;
  line.textContent = message;
  terminalLog.appendChild(line);
  terminalLog.scrollTop = terminalLog.scrollHeight;
}

// Clear Terminal
btnClearLog.addEventListener('click', () => {
  terminalLog.innerHTML = '<div class="terminal-line info">[Terminal cleared]</div>';
});

// Clear / Reset Form
if (btnClearForm) {
  btnClearForm.addEventListener('click', () => {
    targetUrlInput.value = '';
    projectNameInput.value = '';
    ctaUrlInput.value = 'https://yourstore.myscalev.com/your-checkout';
    setEngineMode('puppeteer');
    targetUrlInput.focus();
    appendLog('[Form] Input form berhasil di-reset.', 'info');
  });
}

// Quick Example filler
window.fillExample = function(url, name) {
  targetUrlInput.value = url;
  projectNameInput.value = name;
  projectNameInput.focus();
};

// Fetch Projects List
async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    const data = await res.json();
    if (data.success) {
      allProjects = data.projects;
      renderProjects(allProjects);
    }
  } catch (err) {
    console.error('Failed to load projects', err);
    projectsList.innerHTML = '<div style="color: red; padding: 20px; font-weight: bold;">Failed to load projects. Make sure the server is running.</div>';
  }
}

// Instant Refresh Projects Button
if (btnRefreshProjects) {
  btnRefreshProjects.addEventListener('click', async () => {
    if (refreshIcon) refreshIcon.classList.add('spin');
    btnRefreshProjects.disabled = true;
    appendLog('🔄 Syncing projects list from disk (/projects)...', 'info');
    await loadProjects();
    setTimeout(() => {
      if (refreshIcon) refreshIcon.classList.remove('spin');
      btnRefreshProjects.disabled = false;
    }, 600);
  });
}

// Render Projects List
function renderProjects(projects) {
  projectCount.textContent = `${projects.length} Projects`;

  if (projects.length === 0) {
    projectsList.innerHTML = `
      <div style="text-align: center; padding: 30px; border: 2px dashed #000; border-radius: 8px; background: #fff;">
        <div style="font-size: 28px; margin-bottom: 8px;">📂</div>
        <div style="font-weight: 800;">No Projects Yet</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">Use the form on the left to clone your first landing page!</div>
      </div>
    `;
    return;
  }

  projectsList.innerHTML = projects.map(p => {
    const kb = Math.round(p.size / 1024);
    const date = new Date(p.lastModified).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return `
      <div class="project-card">
        <div class="project-top">
          <div class="project-name">
            <span>📁</span> ${p.name}
          </div>
          <span style="font-size: 11px; font-weight: 700; color: #555;">${date}</span>
        </div>

        <div class="project-badges">
          <span class="mini-badge scalev">1-File index.html</span>
          <span class="mini-badge size">${kb} KB</span>
          ${p.hasGuide ? '<span class="mini-badge" style="background:#FFE600">Guide Included</span>' : ''}
        </div>

        <div class="project-actions">
          <button class="btn btn-sm btn-yellow" onclick="openPreview('${p.name}')">
            👁️ Preview
          </button>
          <button class="btn btn-sm" onclick="openFolder('${p.name}')" title="Open project folder in File Explorer">
            📂 Folder
          </button>
          <button class="btn btn-sm btn-pink" onclick="confirmDeleteProject('${p.name}')" title="Hapus project">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Engine Mode Selector Logic
const optionPuppeteer = document.getElementById('optionPuppeteer');
const optionFast = document.getElementById('optionFast');
const modePuppeteer = document.getElementById('modePuppeteer');
const modeFast = document.getElementById('modeFast');

function setEngineMode(mode) {
  if (mode === 'puppeteer') {
    if (modePuppeteer) modePuppeteer.checked = true;
    if (optionPuppeteer) optionPuppeteer.classList.add('active');
    if (optionFast) optionFast.classList.remove('active');
  } else {
    if (modeFast) modeFast.checked = true;
    if (optionFast) optionFast.classList.add('active');
    if (optionPuppeteer) optionPuppeteer.classList.remove('active');
  }
}

if (optionPuppeteer) {
  optionPuppeteer.addEventListener('click', () => setEngineMode('puppeteer'));
}
if (optionFast) {
  optionFast.addEventListener('click', () => setEngineMode('fast'));
}

// Search Filter
searchProjects.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allProjects.filter(p => p.name.toLowerCase().includes(q));
  renderProjects(filtered);
});

// Form Submission (Trigger Clone Engine)
cloneForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const url = targetUrlInput.value.trim();
  const projectName = projectNameInput.value.trim();
  const ctaUrl = ctaUrlInput.value.trim();
  const mode = document.querySelector('input[name="clonerMode"]:checked')?.value || 'puppeteer';

  if (!url || !projectName) {
    alert('Please enter both URL and Project Name!');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = mode === 'puppeteer' 
    ? '⏳ LAUNCHING BROWSER & RENDERING JAVASCRIPT...' 
    : '⏳ DOWNLOADING PAGE... PLEASE WAIT';
  btnSubmit.style.opacity = '0.7';
  setEngineStatus('processing', mode === 'puppeteer' ? 'Running Puppeteer Engine...' : 'Downloading & Processing...');

  appendLog(`>>> STARTING CLONE: ${projectName} (${url}) [Mode: ${mode.toUpperCase()}]`, 'step');

  try {
    const res = await fetch('/api/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, projectName, ctaUrl, mode })
    });

    const data = await res.json();

    if (data.success) {
      setEngineStatus('success', 'Clone Successful!');
      if (data.logs && data.logs.length > 0) {
        data.logs.forEach(l => appendLog(l.msg, l.type));
      }
      appendLog(`🎉 SUCCESS! Project ready at: projects/${data.result.projectName}/`, 'finish');
      
      // Reload projects list
      await loadProjects();

      // Show instant preview
      setTimeout(() => {
        openPreview(data.result.projectName);
      }, 600);

    } else {
      setEngineStatus('error', 'Clone Failed');
      appendLog(`[FAILED] ${data.error || 'An error occurred during cloning'}`, 'error');
      alert('Clone failed: ' + data.error);
    }

  } catch (err) {
    setEngineStatus('error', 'Connection Lost');
    appendLog(`[NETWORK ERROR] ${err.message}`, 'error');
    alert('Connection failed: ' + err.message);
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '⚡ CLONE NOW';
    btnSubmit.style.opacity = '1';
  }
});


// Open Project Folder in File Explorer
window.openFolder = async function(folderName) {
  try {
    await fetch('/api/open-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: folderName })
    });
  } catch (err) {
    console.error('Failed to open folder', err);
  }
};

// Preview Modal Logic
window.openPreview = function(projectName) {
  const previewUrl = `/preview/${encodeURIComponent(projectName)}/index.html`;
  previewTitle.textContent = `👁️ PREVIEW: ${projectName}`;
  previewFrame.src = previewUrl;
  btnOpenNewTab.href = previewUrl;
  previewModal.classList.add('show');
};

window.closePreview = function() {
  previewModal.classList.remove('show');
  previewFrame.src = 'about:blank';
};

window.setViewport = function(mode) {
  if (mode === 'mobile') {
    previewFrame.classList.add('mobile');
  } else {
    previewFrame.classList.remove('mobile');
  }
};

// Close modal on click outside
previewModal.addEventListener('click', (e) => {
  if (e.target === previewModal) closePreview();
});

// Delete Project Confirmation Modal Logic
window.confirmDeleteProject = function(projectName) {
  projectToDelete = projectName;
  if (deleteProjectTargetName) {
    deleteProjectTargetName.textContent = projectName;
  }
  if (deleteModal) {
    deleteModal.classList.add('show');
  }
};

window.closeDeleteModal = function() {
  if (deleteModal) {
    deleteModal.classList.remove('show');
  }
  projectToDelete = null;
};

// Close delete modal on click outside
if (deleteModal) {
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });
}

// Confirm Delete Handler
if (btnConfirmDelete) {
  btnConfirmDelete.addEventListener('click', async () => {
    if (!projectToDelete) return;
    const target = projectToDelete;
    btnConfirmDelete.disabled = true;
    btnConfirmDelete.textContent = '⏳ Menghapus...';

    try {
      const res = await fetch('/api/delete-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: target })
      });
      const data = await res.json();

      if (data.success) {
        appendLog(`🗑️ Project "${target}" berhasil dihapus dari disk.`, 'step');
        closeDeleteModal();
        await loadProjects();
      } else {
        alert('Gagal menghapus project: ' + (data.error || 'Unknown error'));
        appendLog(`[HAPUS GAGAL] ${data.error}`, 'error');
      }
    } catch (err) {
      console.error('Failed to delete project', err);
      alert('Gagal menghapus project: ' + err.message);
      appendLog(`[NETWORK ERROR] ${err.message}`, 'error');
    } finally {
      btnConfirmDelete.disabled = false;
      btnConfirmDelete.innerHTML = '🗑️ Hapus Permanen';
    }
  });
}

// Initial load
loadProjects();
