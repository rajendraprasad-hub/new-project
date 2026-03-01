// ================================
// Notification Bell Logic
// ================================
async function fetchNotifications() {
  // Fetch announcements and knowledge updates
  const [annRes, kbRes] = await Promise.all([
    fetch('/api/announcements'),
    fetch('/api/knowledge')
  ]);
  const announcements = await annRes.json();
  const knowledge = await kbRes.json();
  return { announcements, knowledge };
}

function getUnreadIds(type) {
  // type: 'announcements' | 'knowledge'
  try {
    const val = sessionStorage.getItem('unread_' + type);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

function setUnreadIds(type, ids) {
  try {
    sessionStorage.setItem('unread_' + type, JSON.stringify(ids));
  } catch {}
}

function markAllRead(type, ids) {
  setUnreadIds(type, []);
}

function updateNotificationUI(notifications) {
  const { announcements, knowledge } = notifications;
  const bell = document.getElementById('notificationBell');
  const badge = document.getElementById('notificationBadge');
  const dropdown = document.getElementById('notificationDropdown');
  const list = document.getElementById('notificationList');
  if (!bell || !badge || !dropdown || !list) return;

  // Get IDs for unread tracking
  const annIds = announcements.map(a => a.id || a.time || a.title);
  const kbIds = knowledge.map(k => k.id || k.time || k.title);
  let unreadAnn = getUnreadIds('announcements').filter(id => annIds.includes(id));
  let unreadKb = getUnreadIds('knowledge').filter(id => kbIds.includes(id));

  // If first load, mark all as unread
  if (!sessionStorage.getItem('unread_announcements')) setUnreadIds('announcements', annIds);
  if (!sessionStorage.getItem('unread_knowledge')) setUnreadIds('knowledge', kbIds);

  unreadAnn = getUnreadIds('announcements').filter(id => annIds.includes(id));
  unreadKb = getUnreadIds('knowledge').filter(id => kbIds.includes(id));

  const unreadCount = unreadAnn.length + unreadKb.length;
  badge.textContent = unreadCount;
  badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';

  // Build notification list
  let items = [];
  if (announcements.length > 0) {
    items.push('<li class="notification-header" style="font-size:14px;">Announcements</li>');
    for (const a of announcements.slice(0, 5)) {
      const isUnread = unreadAnn.includes(a.id || a.time || a.title);
      items.push(`<li class="${isUnread ? 'notification-unread' : ''}" data-type="announcements" data-id="${a.id || a.time || a.title}"><b>${a.title}</b><br><span style='font-size:13px;'>${a.message}</span></li>`);
    }
  }
  if (knowledge.length > 0) {
    items.push('<li class="notification-header" style="font-size:14px;">Knowledge Updates</li>');
    for (const k of knowledge.slice(0, 5)) {
      const isUnread = unreadKb.includes(k.id || k.time || k.title);
      items.push(`<li class="${isUnread ? 'notification-unread' : ''}" data-type="knowledge" data-id="${k.id || k.time || k.title}"><b>${k.title || 'Knowledge Update'}</b><br><span style='font-size:13px;'>${k.message || k.desc || ''}</span></li>`);
    }
  }
  if (items.length === 0) {
    items = ["<li class='notification-empty'>No new notifications</li>"];
  }
  list.innerHTML = items.join('');
}

function setupNotificationBell() {
  const bell = document.getElementById('notificationBell');
  const dropdown = document.getElementById('notificationDropdown');
  const list = document.getElementById('notificationList');
  if (!bell || !dropdown || !list) return;

  let open = false;
  bell.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (open) {
      dropdown.classList.remove('show');
      open = false;
      return;
    }
    // Fetch and update notifications
    const notifications = await fetchNotifications();
    updateNotificationUI(notifications);
    dropdown.classList.add('show');
    open = true;
  });

  // Mark as read on click
  list.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-type]');
    if (!li) return;
    const type = li.getAttribute('data-type');
    const id = li.getAttribute('data-id');
    let unread = getUnreadIds(type);
    unread = unread.filter(x => x !== id);
    setUnreadIds(type, unread);
    li.classList.remove('notification-unread');
    // Update badge
    fetchNotifications().then(updateNotificationUI);
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== bell) {
      dropdown.classList.remove('show');
      open = false;
    }
  });
}

// Add unread style
const style = document.createElement('style');
style.textContent = `.notification-unread { background: #e3f2fd !important; }`;
document.head.appendChild(style);

// Initialize notification bell on DOMContentLoaded
document.addEventListener('DOMContentLoaded', setupNotificationBell);
// ================================
// Infosys Portal - Frontend Script
// ================================

let CURRENT_USER = null;

// Helper: create safe link element (prevents text injection)
function createLink(text, href, className, newTab = false) {
  const a = document.createElement("a");
  a.textContent = text || "";
  a.href = href || "#";
  if (className) a.className = className;
  if (newTab) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  a.setAttribute('role', 'link');
  return a;
}

function createCell(text) {
  const td = document.createElement("td");
  td.textContent = text === undefined || text === null ? "" : String(text);
  return td;
}

function createFileTypeCell(icon, typeText) {
  const td = document.createElement("td");
  const wrapper = document.createElement("div");
  wrapper.className = "file-type";
  const img = document.createElement("img");
  img.src = icon;
  img.alt = typeText;
  wrapper.appendChild(img);
  wrapper.appendChild(document.createTextNode(" " + (typeText || "")));
  td.appendChild(wrapper);
  return td;
}

// ✅ Fetch session user
async function getCurrentUser() {
  try {
    const res = await fetch("/api/me");
    const data = await res.json();

    if (data.loggedIn) {
      CURRENT_USER = data.user;
      return data.user;
    }

    CURRENT_USER = null;
    return null;
  } catch (err) {
    console.log("❌ Error fetching /api/me:", err);
    return null;
  }
}

// ✅ Fill Profile Dropdown Values
function fillProfileDropdown(user) {
  const nameEl = document.getElementById("pName");
  const empEl = document.getElementById("pEmpId");
  const teamEl = document.getElementById("pTeam");
  const roleEl = document.getElementById("pRole");

  if (!user) return;

  if (nameEl) nameEl.textContent = user.name || "-";
  if (empEl) empEl.textContent = "Emp ID: " + (user.empId || "-");
  if (teamEl) teamEl.textContent = user.team || "-";
  if (roleEl) roleEl.textContent = user.role || "-";
}

// ✅ Load session user and update Profile dropdown
async function loadUserUI() {
  const user = await getCurrentUser();
  if (user) fillProfileDropdown(user);
}

// Show welcome hero (Lottie with CSS fallback) once per session
function showWelcomeHero(user) {
  if (!user) return;
  try {
    const seen = sessionStorage.getItem('seen_welcome');
    const container = document.getElementById('welcomeLottie');
    const nameEl = document.getElementById('welcomeName');
    if (nameEl) nameEl.textContent = user.name || user.displayName || 'User';

    if (!container) return;

    // Respect reduced motion
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      container.innerHTML = '<div class="welcome-fallback" aria-hidden="true">✨</div>';
      return;
    }

    // If already shown this session, don't autoplay again – show small static icon
    if (seen) {
      container.innerHTML = '<div class="welcome-fallback" aria-hidden="true">✨</div>';
      return;
    }

    // Load Lottie animation if available
    const lottiePath = 'https://assets2.lottiefiles.com/packages/lf20_jbrw3hcz.json';
    if (window.lottie && typeof window.lottie.loadAnimation === 'function') {
      const anim = window.lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: lottiePath
      });

      // play once, then fade to fallback after 2s (or on complete)
      anim.addEventListener('complete', () => {
        try { sessionStorage.setItem('seen_welcome', '1'); } catch (e) {}
        container.classList.add('anim-scale');
        setTimeout(() => { container.innerHTML = '<div class="welcome-fallback" aria-hidden="true">✨</div>'; }, 600);
      });

      // safety: if it errors, show fallback
      anim.addEventListener('error', () => {
        container.innerHTML = '<div class="welcome-fallback" aria-hidden="true">✨</div>';
      });
    } else {
      // Lottie not loaded – fallback
      container.innerHTML = '<div class="welcome-fallback" aria-hidden="true">✨</div>';
      try { sessionStorage.setItem('seen_welcome', '1'); } catch (e) {}
    }
  } catch (err) {
    console.warn('Welcome hero failed', err);
  }
}

// ✅ Logout
async function logoutUser() {
  try {
    await fetch("/api/logout", { method: "POST" });
    alert("✅ Logged out successfully!");
    window.location.href = "/login.html";
  } catch (err) {
    alert("❌ Logout failed. Try again.");
  }
}

// ================================
// ✅ DARK MODE (SAVE + APPLY)
// ================================
function applyDarkModeFromStorage() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");

  if (isDark) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

// ✅ Fetch files
async function fetchFiles() {
  try {
    const res = await fetch("/api/files");
    const data = await res.json();
    return data;
  } catch (err) {
    console.log("❌ Error fetching files:", err);
    return [];
  }
}

// ✅ Icon mapping (SVG)
function getIcon(type) {
  type = String(type || "").toLowerCase();

  if (type === "pdf") return "assets/pdf-icon.svg";
  if (type === "xlsx" || type === "xls") return "assets/excel-icon.svg";
  if (type === "pptx" || type === "ppt") return "assets/ppt-icon.svg";

  return "assets/doc-icon.svg";
}

function getTypeText(type) {
  return String(type || "").toUpperCase();
}

function getDescription(type) {
  type = String(type || "").toLowerCase();

  if (type === "pdf") return "PDF Document";
  if (type === "xlsx" || type === "xls") return "Excel File";
  if (type === "pptx" || type === "ppt") return "Presentation File";
  if (type === "jpg" || type === "jpeg" || type === "png") return "Image File";

  return "Document File";
}

// ✅ Remove uploads/ for UI
function cleanUploadName(name) {
  return String(name || "").replace("uploads/", "");
}

// CSRF token helper
window.__CSRF_TOKEN = null;
async function fetchCsrfToken() {
  try {
    const res = await fetch('/api/csrf-token');
    if (res.ok) {
      const data = await res.json();
      window.__CSRF_TOKEN = data.csrfToken;
    }
  } catch (err) {
    console.warn('Could not fetch CSRF token', err);
  }
}

function apiFetch(url, options = {}) {
  options.headers = options.headers || {};
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && window.__CSRF_TOKEN) {
    options.headers['x-csrf-token'] = window.__CSRF_TOKEN;
  }
  return fetch(url, options);
}

// ================================
// ✅ HOME PAGE: Recent 4 files table
// ================================
async function loadRecentFiles() {
  const tableBody = document.getElementById("recentFilesBox");
  if (!tableBody) return;

  const files = await fetchFiles();

  if (!files || files.length === 0) {
    tableBody.innerHTML = "";
    const r = document.createElement("tr");
    const c = document.createElement("td");
    c.colSpan = 4;
    c.textContent = "No files uploaded yet.";
    r.appendChild(c);
    tableBody.appendChild(r);
    return;
  }

  const recentFiles = files.slice(0, 4);
  tableBody.innerHTML = "";

  recentFiles.forEach((f) => {
    const icon = getIcon(f.type);
    const typeText = getTypeText(f.type);
    const desc = getDescription(f.type);

    const viewLink = f.url;
    const downloadLink = f.trackedUrl || f.url;

    const row = document.createElement("tr");

    const nameTd = document.createElement("td");
    const strong = document.createElement("strong");
    const qRecent = '';
    strong.innerHTML = highlightText(cleanUploadName(f.fileName), qRecent);
    nameTd.appendChild(strong);

    row.appendChild(nameTd);
    row.appendChild(createFileTypeCell(icon, typeText));
    row.appendChild(createCell(desc));

    const actionTd = document.createElement("td");
    const viewA = createLink("View", viewLink, "btn", true);
    const dlA = createLink("Download", downloadLink, "btn btn-secondary", true);
    dlA.style.marginLeft = "8px";
    actionTd.appendChild(viewA);
    actionTd.appendChild(dlA);

    row.appendChild(actionTd);
    tableBody.appendChild(row);
  });
}

// ================================
// ✅ RESOURCES PAGE: Table + Search + Type Filter + Upload + Delete
// ================================
async function loadResourcesTable() {
  const tableBody = document.getElementById("filesTableBody");
  const searchInput = document.getElementById("searchInput");
  const typeFilter = document.getElementById("typeFilter");

  if (!tableBody) return;

  const user = await getCurrentUser();
  const files = await fetchFiles();

  function render(data) {
    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
      const r = document.createElement("tr");
      const c = document.createElement("td");
      c.colSpan = 7;
      c.textContent = "No matching files found.";
      r.appendChild(c);
      tableBody.appendChild(r);
      return;
    }

    data.forEach((f) => {
      const icon = getIcon(f.type);
      const typeText = getTypeText(f.type);
      const desc = getDescription(f.type);

      const viewLink = f.url;
      const downloadLink = f.trackedUrl || f.url;

      const row = document.createElement("tr");

      // Favorite star cell
      const favTd = document.createElement('td');
      const starBtn = document.createElement('button');
      starBtn.className = 'star-btn';
      starBtn.setAttribute('aria-label', `Add ${f.cleanName || f.fileName} to favorites`);
      starBtn.setAttribute('role', 'button');
      try {
        const favsRaw = localStorage.getItem('portal_favorites') || '{}';
        const favsObj = JSON.parse(favsRaw);
        if (favsObj[f.fileName]) starBtn.classList.add('active');
      } catch (e) {}
      starBtn.innerHTML = '★';
      starBtn.addEventListener('click', () => {
        const raw = localStorage.getItem('portal_favorites') || '{}';
        const obj = JSON.parse(raw);
        if (obj[f.fileName]) delete obj[f.fileName];
        else obj[f.fileName] = { fileName: f.fileName, url: f.url, type: f.type };
        localStorage.setItem('portal_favorites', JSON.stringify(obj));
        starBtn.classList.toggle('active');
        starBtn.setAttribute('aria-label', `${starBtn.classList.contains('active') ? 'Remove' : 'Add'} ${f.cleanName || f.fileName} from favorites`);
        if (typeof renderFavorites === 'function') renderFavorites();
      });
      favTd.appendChild(starBtn);

      const nameTd = document.createElement("td");
      const strong = document.createElement("strong");
      const q = searchInput ? searchInput.value.trim() : '';
      strong.innerHTML = highlightText(cleanUploadName(f.fileName), q);
      nameTd.appendChild(strong);

      row.appendChild(nameTd);
      // insert favorite and select checkbox before name
      const selectTd = document.createElement('td');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'file-checkbox';
      cb.setAttribute('aria-label', `Select ${f.cleanName || f.fileName}`);
      selectTd.style.textAlign = 'center';
      selectTd.appendChild(cb);
      row.insertBefore(favTd, nameTd);
      row.insertBefore(selectTd, nameTd);

      row.appendChild(createFileTypeCell(icon, typeText));
      row.appendChild(createCell(f.category || "-"));
      row.appendChild(createCell(desc));

      const actionTd = document.createElement("td");
      actionTd.style.textAlign = 'center';
      const viewA = createLink("View", viewLink, "btn", false);
      viewA.setAttribute('aria-label', `View ${f.cleanName || f.fileName}`);
      viewA.addEventListener('click', (ev) => { ev.preventDefault(); openPreview(viewLink, f.type, f.fileName); });
      const dlA = createLink("Download", downloadLink, "btn btn-secondary", true);
      dlA.setAttribute('aria-label', `Download ${f.cleanName || f.fileName}`);
      dlA.style.marginLeft = "8px";
      actionTd.appendChild(viewA);
      actionTd.appendChild(dlA);

      row.appendChild(actionTd);

      tableBody.appendChild(row);
    });
  }

  // ✅ Filter function (Search + Type)
  function applyFilters() {
    const q = searchInput ? searchInput.value.toLowerCase() : "";
    const type = typeFilter ? typeFilter.value : "all";

    const filtered = files.filter((f) => {
      const matchSearch = String(f.fileName).toLowerCase().includes(q);
      const matchType = type === "all" ? true : String(f.type).toLowerCase() === type;
      return matchSearch && matchType;
    });

    render(filtered);
  }

  render(files);

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (typeFilter) typeFilter.addEventListener("change", applyFilters);
}

// ✅ Upload file function (Resources page)
// NOTE: Your HTML uses uploadFileInput + onclick="uploadFile()"
async function uploadFile() {
  const fileInput = document.getElementById("uploadFileInput");
  const msgEl = document.getElementById("uploadMsg");

  if (!fileInput || !msgEl) return;

  const user = await getCurrentUser();
  if (!user) return;

  const canUpload = user.role === "uploader" || user.role === "admin";
  if (!canUpload) {
    msgEl.textContent = "❌ Upload access denied.";
    notify.error('Upload access denied');
    return;
  }

  if (!fileInput.files || fileInput.files.length === 0) {
    msgEl.textContent = "❌ Please choose a file first.";
    return;
  }

  // Support multiple files and show progress
  const files = Array.from(fileInput.files);
  uploadFiles(files);
}

// Upload multiple files with progress using XHR
function uploadFiles(files) {
  const msgEl = document.getElementById("uploadMsg");
  const listEl = document.getElementById('uploadProgressList');
  if (msgEl) msgEl.textContent = '';
  if (listEl) listEl.innerHTML = ''; // Clear previous uploads
  if (!files || files.length === 0) return;

  const promises = files.map((file) => {
    return new Promise((resolve) => {
      const item = document.createElement('div');
      item.className = 'progress-item';

      const name = document.createElement('div');
      name.textContent = file.name;
      name.style.minWidth = '180px';

      const track = document.createElement('div');
      track.className = 'progress-track';
      const bar = document.createElement('div');
      bar.className = 'progress-bar';
      track.appendChild(bar);

      const meta = document.createElement('div');
      meta.className = 'progress-meta';
      meta.textContent = '0%';

      item.appendChild(name);
      item.appendChild(track);
      item.appendChild(meta);

      if (listEl) listEl.appendChild(item);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      // Attach CSRF token header if available
      if (window.__CSRF_TOKEN) xhr.setRequestHeader('x-csrf-token', window.__CSRF_TOKEN);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          bar.style.width = pct + '%';
          meta.textContent = pct + '%';
        }
      });

      xhr.onload = function () {
        try {
          const status = xhr.status;
          const resp = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          if (status >= 200 && status < 300) {
            bar.style.width = '100%';
            meta.textContent = 'Done';
            notify.success(file.name + ' uploaded');
            resolve({ ok: true, file: file.name });
          } else {
            meta.textContent = 'Error';
            notify.error(file.name + ': ' + (resp.message || 'Upload failed'));
            resolve({ ok: false, file: file.name });
          }
        } catch (err) {
          meta.textContent = 'Error';
          notify.error(file.name + ': Upload parse error');
          resolve({ ok: false, file: file.name });
        }
      };

      xhr.onerror = function () {
        meta.textContent = 'Error';
        notify.error(file.name + ': Network error');
        resolve({ ok: false, file: file.name });
      };

      const fd = new FormData();
      fd.append('file', file);
      xhr.send(fd);
    });
  });

  Promise.all(promises).then(() => {
    if (msgEl) msgEl.textContent = 'Upload(s) finished';
    // refresh list
    setTimeout(() => loadResourcesTable(), 700);
    // clear file input
    const fi = document.getElementById('uploadFileInput'); if (fi) fi.value = '';
  });
}

// ✅ Delete file (Admin only)
async function deleteFile(filePath) {
  if (!confirm("Are you sure you want to delete this file? (It will move to Trash)")) return;

  try {
    const res = await apiFetch(`/api/admin/delete/${filePath}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      alert("❌ " + (data.message || "Delete failed"));
      return;
    }

    alert("✅ File moved to trash!");
    loadResourcesTable();
  } catch (err) {
    alert("❌ Server error while deleting file.");
  }
}

// ================================
// ✅ REPORTS PAGE
// ================================
async function loadReportsStats() {
  const box = document.getElementById("statsBox");
  if (!box) return;

  try {
    const res = await fetch("/api/admin/stats");
    const data = await res.json();

    if (!res.ok) {
      box.innerHTML = "";
      const p = document.createElement("p");
      p.textContent = "❌ Admin access only.";
      box.appendChild(p);
      return;
    }

    box.innerHTML = "";
    const pDate = document.createElement("p");
    const bDate = document.createElement("b");
    bDate.textContent = "Date:";
    pDate.appendChild(bDate);
    pDate.appendChild(document.createTextNode(" " + String(data.today)));

    const pLogins = document.createElement("p");
    const bLogins = document.createElement("b");
    bLogins.textContent = "Logins Today:";
    pLogins.appendChild(bLogins);
    pLogins.appendChild(document.createTextNode(" " + String(data.todayLogins)));

    const pUploads = document.createElement("p");
    const bUploads = document.createElement("b");
    bUploads.textContent = "Uploads Today:";
    pUploads.appendChild(bUploads);
    pUploads.appendChild(document.createTextNode(" " + String(data.todayUploads)));

    const pDownloads = document.createElement("p");
    const bDownloads = document.createElement("b");
    bDownloads.textContent = "Downloads Today:";
    pDownloads.appendChild(bDownloads);
    pDownloads.appendChild(document.createTextNode(" " + String(data.todayDownloads)));

    const pTotal = document.createElement("p");
    const bTotal = document.createElement("b");
    bTotal.textContent = "Total Logs:";
    pTotal.appendChild(bTotal);
    pTotal.appendChild(document.createTextNode(" " + String(data.totalLogs)));

    box.appendChild(pDate);
    box.appendChild(pLogins);
    box.appendChild(pUploads);
    box.appendChild(pDownloads);
    box.appendChild(pTotal);
  } catch (err) {
    box.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = "❌ Error loading stats";
    box.appendChild(p);
  }
}

async function loadReportsActivity() {
  const tableBody = document.getElementById("activityTableBody");
  if (!tableBody) return;

  try {
    const res = await fetch("/api/admin/activity");
    const logs = await res.json();

    if (!res.ok) {
      tableBody.innerHTML = "";
      const r = document.createElement("tr");
      const c = document.createElement("td");
      c.colSpan = 5;
      c.textContent = "❌ Admin access only.";
      r.appendChild(c);
      tableBody.appendChild(r);
      return;
    }

    tableBody.innerHTML = "";

    const recent = logs.slice(0, 20);

    recent.forEach((l) => {
      const row = document.createElement("tr");
      row.appendChild(createCell(l.time));
      row.appendChild(createCell(l.type));
      row.appendChild(createCell(l.empId));
      row.appendChild(createCell(l.name));
      row.appendChild(createCell(l.file || "-"));
      tableBody.appendChild(row);
    });

    if (recent.length === 0) {
      const r = document.createElement("tr");
      const c = document.createElement("td");
      c.colSpan = 5;
      c.textContent = "No activity yet.";
      r.appendChild(c);
      tableBody.appendChild(r);
    }
  } catch (err) {
    tableBody.innerHTML = "";
    const r = document.createElement("tr");
    const c = document.createElement("td");
    c.colSpan = 5;
    c.textContent = "❌ Error loading activity";
    r.appendChild(c);
    tableBody.appendChild(r);
  }
}

// ✅ Export CSV (Admin)
function exportCSV() {
  window.open("/api/admin/export", "_blank");
}

// ================================
// ✅ ANNOUNCEMENTS (Home Page)
// ================================
async function loadAnnouncements() {
  const box = document.getElementById("announcementBox");
  if (!box) return;

  try {
    const res = await fetch("/api/announcements");
    const list = await res.json();

    if (!res.ok) {
      box.innerHTML = "";
      const p = document.createElement("p");
      p.textContent = "❌ Unable to load announcements.";
      box.appendChild(p);
      return;
    }

    if (!list || list.length === 0) {
      box.innerHTML = "";
      const p = document.createElement("p");
      p.className = "small-text";
      p.textContent = "No announcements yet.";
      box.appendChild(p);
      return;
    }

    box.innerHTML = "";
    list.slice(0, 4).forEach((a) => {
      const wrap = document.createElement("div");
      wrap.style.padding = "12px";
      wrap.style.border = "1px solid #ddd";
      wrap.style.borderRadius = "10px";
      wrap.style.marginBottom = "10px";

      const h4 = document.createElement("h4");
      h4.style.margin = "0 0 6px 0";
      h4.textContent = `📢 ${a.title || ""}`;

      const pMsg = document.createElement("p");
      pMsg.style.margin = "0";
      pMsg.textContent = a.message || "";

      const pMeta = document.createElement("p");
      pMeta.style.margin = "6px 0 0 0";
      pMeta.style.fontSize = "12px";
      pMeta.style.color = "#555";
      pMeta.innerHTML = `Team: <b>${String(a.team || "ALL")}</b> | ${new Date(a.createdAt).toLocaleString()}`;

      wrap.appendChild(h4);
      wrap.appendChild(pMsg);
      wrap.appendChild(pMeta);
      box.appendChild(wrap);
    });
  } catch (err) {
    box.innerHTML = `<p>❌ Server error loading announcements.</p>`;
  }
}

// ✅ Admin Post Announcement (Reports page)
async function postAnnouncement() {
  const titleEl = document.getElementById("announceTitle");
  const messageEl = document.getElementById("announceMessage");
  const teamEl = document.getElementById("announceTeam");
  const msgEl = document.getElementById("announceMsg");

  if (!titleEl || !messageEl || !teamEl || !msgEl) return;

  const title = titleEl.value.trim();
  const message = messageEl.value.trim();
  const team = teamEl.value;

  if (!title || !message) {
    msgEl.textContent = "❌ Title and message are required.";
    return;
  }

  msgEl.textContent = "Posting... ⏳";

  try {
    const res = await apiFetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, team })
    });

    const data = await res.json();

    if (!res.ok) {
      msgEl.textContent = "❌ " + (data.message || "Failed to post announcement");
      return;
    }

    msgEl.textContent = "✅ Announcement posted successfully!";
    titleEl.value = "";
    messageEl.value = "";
    teamEl.value = "ALL";
  } catch (err) {
    msgEl.textContent = "❌ Server error. Try again.";
  }
}

// ================================
// ✅ KNOWLEDGE BASE MODULE (WITH ATTACHMENT)
// ================================
async function addKnowledgeUpdate() {
  const msg = document.getElementById("kbMsg");
  if (!msg) return;

  const country = document.getElementById("kbCountry")?.value.trim();
  const carrier = document.getElementById("kbCarrier")?.value.trim();
  const project = document.getElementById("kbProject")?.value.trim();
  const process = document.getElementById("kbProcess")?.value.trim();
  const title = document.getElementById("kbTitle")?.value.trim();
  const details = document.getElementById("kbDetails")?.value.trim();

  const priority = document.getElementById("kbPriority")?.value || "Low";
  const status = document.getElementById("kbStatus")?.value || "New";
  const ticketId = document.getElementById("kbTicketId")?.value.trim() || "";
  const refLink = document.getElementById("kbRefLink")?.value.trim() || "";

  const fileInput = document.getElementById("kbFile");
  const file = fileInput && fileInput.files && fileInput.files.length > 0 ? fileInput.files[0] : null;

  if (!country || !carrier || !project || !process || !title || !details) {
    msg.textContent = "❌ Please fill all required fields (*)";
    return;
  }

  msg.textContent = "Saving... ⏳";

  try {
    const formData = new FormData();
    formData.append("country", country);
    formData.append("carrier", carrier);
    formData.append("project", project);
    formData.append("process", process);
    formData.append("title", title);
    formData.append("details", details);
    formData.append("priority", priority);
    formData.append("status", status);
    formData.append("ticketId", ticketId);
    formData.append("refLink", refLink);

    if (file) {
      formData.append("file", file);
    }

    const res = await apiFetch("/api/knowledge", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = "❌ " + (data.message || "Failed to save update");
      return;
    }

    msg.textContent = "✅ Knowledge update saved successfully!";

    document.getElementById("kbCountry").value = "";
    document.getElementById("kbCarrier").value = "";
    document.getElementById("kbProject").value = "";
    document.getElementById("kbProcess").value = "";
    document.getElementById("kbTitle").value = "";
    document.getElementById("kbDetails").value = "";
    document.getElementById("kbTicketId").value = "";
    document.getElementById("kbRefLink").value = "";
    document.getElementById("kbPriority").value = "Low";
    document.getElementById("kbStatus").value = "New";

    if (fileInput) fileInput.value = "";

    loadKnowledgeUpdates();
  } catch (err) {
    msg.textContent = "❌ Server error. Try again.";
  }
}

async function loadKnowledgeUpdates() {
  const tableBody = document.getElementById("kbTableBody");
  const searchInput = document.getElementById("kbSearch");
  if (!tableBody) return;

  const user = await getCurrentUser();

  try {
    const res = await fetch("/api/knowledge");
    const updates = await res.json();

    if (!res.ok) {
      tableBody.innerHTML = "";
      const r = document.createElement("tr");
      const c = document.createElement("td");
      c.colSpan = 11;
      c.textContent = "❌ Unable to load updates";
      r.appendChild(c);
      tableBody.appendChild(r);
      return;
    }

    window.__KB_UPDATES = updates;

    function render(list) {
      tableBody.innerHTML = "";

      if (!list || list.length === 0) {
        const r = document.createElement("tr");
        const c = document.createElement("td");
        c.colSpan = 11;
        c.textContent = "No updates yet.";
        r.appendChild(c);
        tableBody.appendChild(r);
        return;
      }

      list.slice(0, 50).forEach((u) => {
        const date = new Date(u.createdAt).toLocaleDateString();

        const row = document.createElement("tr");

        // Favorite cell
        const favTd = document.createElement('td');
        const starBtn = document.createElement('button');
        starBtn.className = 'star-btn';
        starBtn.setAttribute('aria-label', `Add "${u.title}" to favorites`);
        starBtn.setAttribute('role', 'button');
        try {
          const favsRaw = localStorage.getItem('portal_favorites') || '{}';
          const favsObj = JSON.parse(favsRaw);
          const key = u.id || u.title;
          if (favsObj[key]) starBtn.classList.add('active');
        } catch (e) {}
        starBtn.innerHTML = '★';
        starBtn.addEventListener('click', () => {
          const raw = localStorage.getItem('portal_favorites') || '{}';
          const obj = JSON.parse(raw);
          const key = u.id || u.title;
          if (obj[key]) delete obj[key];
          else obj[key] = { kbId: u.id, title: u.title, attachment: u.attachment };
          localStorage.setItem('portal_favorites', JSON.stringify(obj));
          starBtn.classList.toggle('active');
          starBtn.setAttribute('aria-label', `${starBtn.classList.contains('active') ? 'Remove' : 'Add'} "${u.title}" from favorites`);
          if (typeof renderFavorites === 'function') renderFavorites();
        });
        favTd.appendChild(starBtn);

        // Select checkbox cell
        const selectTd = document.createElement('td');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'kb-checkbox';
        cb.setAttribute('aria-label', `Select "${u.title}"`);
        selectTd.style.textAlign = 'center';
        selectTd.appendChild(cb);

        const dateTd = createCell(date);
        const countryTd = createCell(u.country);
        const carrierTd = createCell(u.carrier);
        const projectTd = createCell(u.project);
        const processTd = createCell(u.process);
        const priorityTd = createCell(u.priority);
        const statusTd = createCell(u.status);

        const titleTd = document.createElement("td");
        const b = document.createElement("b");
        const qKb = searchInput ? searchInput.value.trim() : '';
        b.innerHTML = highlightText(u.title || "", qKb);
        titleTd.appendChild(b);
        const meta = document.createElement('div');
        meta.className = 'small-text';
        meta.style.marginTop = '6px';
        meta.textContent = `By: ${u.createdByName || u.createdBy || '-'} | ${new Date(u.createdAt).toLocaleString()}`;
        titleTd.appendChild(meta);

        // Action cell
        const actionTd = document.createElement("td");
        const viewBtn = document.createElement("button");
        viewBtn.className = "btn";
        viewBtn.textContent = "View";
        viewBtn.setAttribute('aria-label', `View details: "${u.title}"`);
        viewBtn.addEventListener("click", () => viewKnowledgeDetails(u.id));
        actionTd.appendChild(viewBtn);

        // Versions button (frontend scaffold) - will call backend if endpoint exists
        const versionsBtn = document.createElement('button');
        versionsBtn.className = 'btn btn-secondary';
        versionsBtn.style.marginLeft = '6px';
        versionsBtn.textContent = 'Versions';
        versionsBtn.setAttribute('aria-label', `View version history for "${u.title}"`);
        versionsBtn.title = 'View version history';
        versionsBtn.addEventListener('click', () => fetchKbVersions(u.id));
        actionTd.appendChild(versionsBtn);

        if (u.attachment && u.attachment.url) {
          const attachA = createLink("Attachment", u.attachment.url, "btn btn-secondary", false);
          attachA.setAttribute('aria-label', `View attachment for "${u.title}"`);
          attachA.style.marginLeft = "6px";
          attachA.addEventListener('click', (ev) => { ev.preventDefault(); openPreview(u.attachment.url, u.attachment.type || '', u.attachment.originalName || u.attachment.fileName); });
          actionTd.appendChild(attachA);
        }

        if (user && user.role === "admin") {
          const delBtn = document.createElement("button");
          delBtn.className = "btn btn-secondary";
          delBtn.style.marginLeft = "6px";
          delBtn.textContent = "Delete";
          delBtn.setAttribute('aria-label', `Delete "${u.title}"`);
          delBtn.addEventListener("click", () => deleteKnowledgeUpdate(u.id));
          actionTd.appendChild(delBtn);
        }

        // Compose row in header order: Fav, Select, Date, Country, Carrier, Project, Process, Priority, Status, Title, Action
        row.appendChild(favTd);
        row.appendChild(selectTd);
        row.appendChild(dateTd);
        row.appendChild(countryTd);
        row.appendChild(carrierTd);
        row.appendChild(projectTd);
        row.appendChild(processTd);
        row.appendChild(priorityTd);
        row.appendChild(statusTd);
        row.appendChild(titleTd);
        row.appendChild(actionTd);

        tableBody.appendChild(row);
      });
    }

    render(updates);

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();

        const filtered = updates.filter((u) => {
          return (
            String(u.country).toLowerCase().includes(q) ||
            String(u.carrier).toLowerCase().includes(q) ||
            String(u.project).toLowerCase().includes(q) ||
            String(u.process).toLowerCase().includes(q) ||
            String(u.title).toLowerCase().includes(q) ||
            String(u.details).toLowerCase().includes(q)
          );
        });

        render(filtered);
      });
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="9">❌ Server error loading updates</td></tr>`;
  }
}

// ======= Helper: Favorites render (used on home page)
function renderFavorites() {
  const container = document.getElementById('favoritesList');
  if (!container) return;
  const raw = localStorage.getItem('portal_favorites') || '{}';
  let obj = {};
  try { obj = JSON.parse(raw); } catch (e) { obj = {}; }
  container.innerHTML = '';
  Object.keys(obj).forEach(k => {
    const item = obj[k];
    const card = document.createElement('div');
    card.className = 'card';
    card.style.padding = '10px';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = '8px';
    const name = document.createElement('div');
    name.textContent = item.meta && item.meta.fileName ? item.meta.fileName : (item.title || item.fileName || k);
    const open = document.createElement('a');
    open.href = item.url || '#';
    open.textContent = 'Open';
    open.className = 'btn btn-secondary';
    open.target = '_blank';
    card.appendChild(name);
    card.appendChild(open);
    container.appendChild(card);
  });
}

// ====== Search highlight helper
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, q) {
  if (!q) return text;
  try {
    const re = new RegExp('(' + escapeRegExp(q) + ')', 'ig');
    return String(text).replace(re, '<span class="highlight">$1</span>');
  } catch (e) {
    return text;
  }
}

// ======= Preview modal functions
function openPreview(url, type, title) {
  // prefer resources modal first, else KB modal
  const modal = document.getElementById('previewModal') || document.getElementById('previewModalKb');
  const body = document.getElementById('previewBody') || document.getElementById('previewBodyKb');
  if (!modal || !body) return;
  body.innerHTML = '';
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');

  if (/\.(jpg|jpeg|png|gif)$/i.test(url) || (String(type).startsWith('image'))) {
    const img = document.createElement('img');
    img.className = 'preview-img';
    img.src = url;
    img.alt = title || 'Preview image';
    body.appendChild(img);
  } else {
    const iframe = document.createElement('iframe');
    iframe.className = 'preview-iframe';
    iframe.src = url;
    iframe.title = title || 'Preview';
    body.appendChild(iframe);
  }
  const closeBtn = modal.querySelector('.preview-close');
  if (closeBtn) closeBtn.focus();
}

function closePreview(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  const body = modal.querySelector('[id^="previewBody"]');
  if (body) body.innerHTML = '';
}

// Close preview when clicking close or outside content
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('preview-close')) {
    const modal = e.target.closest('.preview-modal');
    if (modal) closePreview(modal.id);
  }
  if (e.target && e.target.classList && e.target.classList.contains('preview-modal')) {
    // click on backdrop
    closePreview(e.target.id);
  }
});

// ESC to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.preview-modal.show').forEach(m => closePreview(m.id));
  }
});


function viewKnowledgeDetails(id) {
  const list = window.__KB_UPDATES || [];
  const item = list.find((x) => x.id === id);

  if (!item) {
    alert("❌ Update not found.");
    return;
  }

  const attachInfo = item.attachment
    ? `Attachment: ${item.attachment.originalName || item.attachment.fileName}`
    : "Attachment: -";

  alert(
    `📌 TITLE: ${item.title}\n\n` +
      `Country: ${item.country}\n` +
      `Carrier: ${item.carrier}\n` +
      `Project: ${item.project}\n` +
      `Process: ${item.process}\n` +
      `Priority: ${item.priority}\n` +
      `Status: ${item.status}\n` +
      `Team: ${item.team}\n` +
      `Created By: ${item.createdByName} (${item.createdBy})\n` +
      `Date: ${new Date(item.createdAt).toLocaleString()}\n` +
      `${attachInfo}\n\n` +
      `DETAILS:\n${item.details}\n\n` +
      `Ticket ID: ${item.ticketId || "-"}\n` +
      `Reference Link: ${item.refLink || "-"}`
  );
}

async function deleteKnowledgeUpdate(id) {
  if (!confirm("Are you sure you want to delete this knowledge update?")) return;

  try {
    const res = await apiFetch(`/api/admin/knowledge/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      alert("❌ " + (data.message || "Delete failed"));
      return;
    }

    alert("✅ Knowledge update deleted!");
    loadKnowledgeUpdates();
  } catch (err) {
    alert("❌ Server error while deleting update.");
  }
}

// Fetch KB versions (frontend scaffold) and show modal
async function fetchKbVersions(id) {
  if (!id) return;
  const modal = document.getElementById('kbVersionsModal');
  const body = document.getElementById('kbVersionsBody');
  if (!modal || !body) return;
  body.innerHTML = 'Loading versions...';
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');

  try {
    const res = await fetch(`/api/knowledge/${id}/versions`);
    if (!res.ok) {
      body.innerHTML = '<div class="small-text">No version history available.</div>';
      return;
    }
    const versions = await res.json();
    if (!Array.isArray(versions) || versions.length === 0) {
      body.innerHTML = '<div class="small-text">No version history found.</div>';
      return;
    }

    const list = document.createElement('div');
    list.className = 'kb-versions-list';
    versions.forEach(v => {
      const item = document.createElement('div');
      item.className = 'kb-version-item';
      item.innerHTML = `<div style="font-weight:600">${v.title || 'Version'}</div>
        <div class="small-text">By: ${v.author || v.createdByName || '-'} | ${new Date(v.createdAt || v.time || Date.now()).toLocaleString()}</div>
        <div style="margin-top:6px">${(v.notes || v.summary || v.details || '').substring(0, 800)}</div>`;
      list.appendChild(item);
    });
    body.innerHTML = '';
    body.appendChild(list);
  } catch (err) {
    body.innerHTML = '<div class="small-text">Error loading versions.</div>';
  }
}

// ================================
// ✅ Reports demo chart (optional)
// ================================
function loadReportsChart() {
  const canvas = document.getElementById("healthChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const cpu = [20, 35, 50, 40, 60, 55];
  const memory = [30, 45, 55, 60, 70, 80];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#999";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 20);
  ctx.lineTo(40, 280);
  ctx.lineTo(600, 280);
  ctx.stroke();

  function drawLine(data, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    data.forEach((val, i) => {
      const x = 60 + i * 90;
      const y = 280 - val * 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }

  drawLine(cpu, "#0033a0");
  drawLine(memory, "#007acc");

  ctx.fillStyle = "#0033a0";
  ctx.fillText("CPU Usage", 480, 25);

  ctx.fillStyle = "#007acc";
  ctx.fillText("Memory Usage", 480, 45);
}

// ================================
// ✅ CONTACT FORM
// ================================
function handleContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value
    };

    try {
      const res = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("✅ Message sent successfully!");
        form.reset();
      } else {
        alert("❌ Failed to send message!");
      }
    } catch (err) {
      alert("❌ Error sending message!");
    }
  });
}

// LOGIN handler (moved from inline script)
function handleLoginForm() {
  const loginForm = document.getElementById("loginForm");
  // support both legacy '#msg' and the visible '#errorMsg' element
  const msg = document.getElementById("msg") || document.getElementById("errorMsg");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) { msg.textContent = ""; msg.classList.remove('show'); }

    const empId = document.getElementById("empId").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await apiFetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empId, password })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.mustChangePassword) {
          window.location.href = "/change-password.html";
        } else {
          window.location.href = "/index.html";
        }
      } else {
        if (msg) {
          msg.textContent = data.message || "Login failed";
          msg.classList.add('show');
        }
      }
    } catch (err) {
      if (msg) {
        msg.textContent = "Server error. Try again.";
        msg.classList.add('show');
      }
    }
  });
}

// Change password handler (moved inline -> script)
async function changePasswordHandler() {
  const oldPassword = document.getElementById("oldPass").value;
  const newPassword = document.getElementById("newPass").value;
  const msg = document.getElementById("passMsg");

  if (msg) msg.textContent = "Updating...";

  try {
    const res = await apiFetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await res.json();

    if (res.ok) {
      if (msg) msg.textContent = "✅ " + data.message + " Redirecting to Home...";
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1200);
    } else {
      if (msg) msg.textContent = "❌ " + (data.message || "Failed");
    }
  } catch (err) {
    if (msg) msg.textContent = "❌ Server error. Try again.";
  }
}

// Profile Dropdown Toggle & Logout
function attachLogoutHandler() {
  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    logoutUser();
  });
}

function toggleProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  if (!dropdown) return;
  dropdown.classList.toggle("show");
}

// ✅ Close dropdown when clicked outside
document.addEventListener("click", function (e) {
  const menu = document.querySelector(".profile-menu");
  const dropdown = document.getElementById("profileDropdown");
  if (!menu || !dropdown) return;

  if (!menu.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});

// ================================
// ✅ Run based on page
// ================================
document.addEventListener("DOMContentLoaded", async () => {
  // Apply saved theme on every page load
  applyDarkModeFromStorage();

  // Dark mode button listener
  const darkModeBtn = document.getElementById('darkModeBtn');
  if (darkModeBtn) darkModeBtn.addEventListener('click', toggleDarkMode);

  // Profile button listener
  const profileBtn = document.getElementById('profileBtn');
  if (profileBtn) profileBtn.addEventListener('click', toggleProfileDropdown);

  // Logout link listener
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
    });
  }

  // File upload button
  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn) uploadBtn.addEventListener('click', uploadFile);

  // Drag & Drop zone handlers
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('uploadFileInput');
  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });

    dropZone.addEventListener('dragenter', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length) {
        const files = Array.from(dt.files);
        // assign to hidden input for fallback
        try { fileInput.files = dt.files; } catch (err) {}
        uploadFiles(files);
      }
    });

    // when user selects files via dialog, show them in progress list and allow upload button to trigger
    fileInput.addEventListener('change', (e) => {
      const v = e.target.files;
      if (v && v.length) {
        const msg = document.getElementById('uploadMsg');
        if (msg) msg.textContent = `${v.length} file(s) selected`;
      }
    });
  }

  // Knowledge base buttons
  const saveKbBtn = document.getElementById('saveKbBtn');
  if (saveKbBtn) saveKbBtn.addEventListener('click', addKnowledgeUpdate);

  const refreshKbBtn = document.getElementById('refreshKbBtn');
  if (refreshKbBtn) refreshKbBtn.addEventListener('click', loadKnowledgeUpdates);

  // Reports buttons
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportCSV);

  const postAnnouncementBtn = document.getElementById('postAnnouncementBtn');
  if (postAnnouncementBtn) postAnnouncementBtn.addEventListener('click', postAnnouncement);

  // ✅ Load user + fill profile dropdown
  await loadUserUI();
  // Show the welcome hero after user info is loaded
  if (typeof showWelcomeHero === 'function') {
    showWelcomeHero(CURRENT_USER);
  }

  // Get CSRF token for state-changing requests (await so it's ready before login submits)
  await fetchCsrfToken();

  // Attach handlers
  handleLoginForm();
  attachLogoutHandler();

  loadAnnouncements();
  loadRecentFiles();
  loadResourcesTable();

  // Render favorites quick access
  renderFavorites();

  loadReportsChart();
  loadReportsStats();
  loadReportsActivity();

  loadKnowledgeUpdates();

  handleContactForm();

  // Change password button (if present)
  const cpBtn = document.getElementById('changePassBtn');
  if (cpBtn) cpBtn.addEventListener('click', changePasswordHandler);

  // KB Versions modal close
  const kbVersionsClose = document.getElementById('kbVersionsClose');
  if (kbVersionsClose) kbVersionsClose.addEventListener('click', () => {
    const m = document.getElementById('kbVersionsModal'); if (m) { m.classList.remove('show'); m.setAttribute('aria-hidden', 'true'); }
  });

  // Hamburger menu toggle for mobile
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('mainNav');
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      mainNav.classList.toggle('show');
    });

    // Close menu when a nav link is clicked
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        mainNav.classList.remove('show');
      });
    });
  }
});

