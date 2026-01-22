// ================================
// Infosys Portal - Frontend Script
// ================================

let CURRENT_USER = null;

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

// ================================
// ✅ HOME PAGE: Recent 4 files table
// ================================
async function loadRecentFiles() {
  const tableBody = document.getElementById("recentFilesBox");
  if (!tableBody) return;

  const files = await fetchFiles();

  if (!files || files.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4">No files uploaded yet.</td></tr>`;
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
    row.innerHTML = `
      <td><strong>${cleanUploadName(f.fileName)}</strong></td>

      <td>
        <div class="file-type">
          <img src="${icon}" alt="${typeText}">
          ${typeText}
        </div>
      </td>

      <td>${desc}</td>

      <td>
        <a class="btn" href="${viewLink}" target="_blank">View</a>
        <a class="btn btn-secondary" style="margin-left:8px;" href="${downloadLink}" target="_blank">
          Download
        </a>
      </td>
    `;

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
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">No matching files found.</td>
        </tr>`;
      return;
    }

    data.forEach((f) => {
      const icon = getIcon(f.type);
      const typeText = getTypeText(f.type);
      const desc = getDescription(f.type);

      const viewLink = f.url;
      const downloadLink = f.trackedUrl || f.url;

      // ✅ Admin delete only for uploaded files
      let adminDeleteBtn = "";
      if (user && user.role === "admin" && String(f.fileName).startsWith("uploads/")) {
        adminDeleteBtn = `
          <button class="btn btn-secondary" style="margin-left:8px;" onclick="deleteFile('${f.fileName}')">
            Delete
          </button>
        `;
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${cleanUploadName(f.fileName)}</strong></td>

        <td>
          <div class="file-type">
            <img src="${icon}" alt="${typeText}">
            ${typeText}
          </div>
        </td>

        <td>${f.category || "-"}</td>
        <td>${desc}</td>

        <td>
          <a class="btn" href="${viewLink}" target="_blank">View</a>
          <a class="btn btn-secondary" style="margin-left:8px;" href="${downloadLink}" target="_blank">
            Download
          </a>
        </td>

        <td>
          ${adminDeleteBtn || "-"}
        </td>
      `;

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
    return;
  }

  if (!fileInput.files || fileInput.files.length === 0) {
    msgEl.textContent = "❌ Please choose a file first.";
    return;
  }

  const file = fileInput.files[0];
  msgEl.textContent = "Uploading... ⏳";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      msgEl.textContent = "❌ " + (data.message || "Upload failed");
      return;
    }

    msgEl.textContent = "✅ Upload Success!";
    fileInput.value = "";
    loadResourcesTable();
  } catch (err) {
    msgEl.textContent = "❌ Server error. Try again.";
  }
}

// ✅ Delete file (Admin only)
async function deleteFile(filePath) {
  if (!confirm("Are you sure you want to delete this file? (It will move to Trash)")) return;

  try {
    const res = await fetch(`/api/admin/delete/${filePath}`, {
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
      box.innerHTML = `<p>❌ Admin access only.</p>`;
      return;
    }

    box.innerHTML = `
      <p><b>Date:</b> ${data.today}</p>
      <p><b>Logins Today:</b> ${data.todayLogins}</p>
      <p><b>Uploads Today:</b> ${data.todayUploads}</p>
      <p><b>Downloads Today:</b> ${data.todayDownloads}</p>
      <p><b>Total Logs:</b> ${data.totalLogs}</p>
    `;
  } catch (err) {
    box.innerHTML = `<p>❌ Error loading stats</p>`;
  }
}

async function loadReportsActivity() {
  const tableBody = document.getElementById("activityTableBody");
  if (!tableBody) return;

  try {
    const res = await fetch("/api/admin/activity");
    const logs = await res.json();

    if (!res.ok) {
      tableBody.innerHTML = `<tr><td colspan="5">❌ Admin access only.</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";

    const recent = logs.slice(0, 20);

    recent.forEach((l) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${l.time}</td>
        <td>${l.type}</td>
        <td>${l.empId}</td>
        <td>${l.name}</td>
        <td>${l.file || "-"}</td>
      `;
      tableBody.appendChild(row);
    });

    if (recent.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5">No activity yet.</td></tr>`;
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5">❌ Error loading activity</td></tr>`;
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
      box.innerHTML = `<p>❌ Unable to load announcements.</p>`;
      return;
    }

    if (!list || list.length === 0) {
      box.innerHTML = `<p class="small-text">No announcements yet.</p>`;
      return;
    }

    let html = "";
    list.slice(0, 4).forEach((a) => {
      html += `
        <div style="padding:12px; border:1px solid #ddd; border-radius:10px; margin-bottom:10px;">
          <h4 style="margin:0 0 6px 0;">📢 ${a.title}</h4>
          <p style="margin:0;">${a.message}</p>
          <p style="margin:6px 0 0 0; font-size:12px; color:#555;">
            Team: <b>${a.team || "ALL"}</b> | ${new Date(a.createdAt).toLocaleString()}
          </p>
        </div>
      `;
    });

    box.innerHTML = html;
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
    const res = await fetch("/api/admin/announcements", {
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

    const res = await fetch("/api/knowledge", {
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
      tableBody.innerHTML = `<tr><td colspan="9">❌ Unable to load updates</td></tr>`;
      return;
    }

    window.__KB_UPDATES = updates;

    function render(list) {
      tableBody.innerHTML = "";

      if (!list || list.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9">No updates yet.</td></tr>`;
        return;
      }

      list.slice(0, 50).forEach((u) => {
        const date = new Date(u.createdAt).toLocaleDateString();

        let adminDeleteBtn = "";
        if (user && user.role === "admin") {
          adminDeleteBtn = `
            <button class="btn btn-secondary" style="margin-left:6px;" onclick="deleteKnowledgeUpdate('${u.id}')">
              Delete
            </button>
          `;
        }

        let attachmentBtn = "";
        if (u.attachment && u.attachment.url) {
          attachmentBtn = `
            <a class="btn btn-secondary" style="margin-left:6px;" href="${u.attachment.url}" target="_blank">
              Attachment
            </a>
          `;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${date}</td>
          <td>${u.country}</td>
          <td>${u.carrier}</td>
          <td>${u.project}</td>
          <td>${u.process}</td>
          <td>${u.priority}</td>
          <td>${u.status}</td>
          <td><b>${u.title}</b></td>
          <td>
            <button class="btn" onclick="viewKnowledgeDetails('${u.id}')">View</button>
            ${attachmentBtn}
            ${adminDeleteBtn}
          </td>
        `;
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
    const res = await fetch(`/api/admin/knowledge/${id}`, { method: "DELETE" });
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
      const res = await fetch("/api/contact", {
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

// ================================
// ✅ Profile Dropdown Toggle
// ================================
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
document.addEventListener("DOMContentLoaded", () => {
  // ✅ Apply saved theme on every page load
  applyDarkModeFromStorage();

  // ✅ Load user + fill profile dropdown
  loadUserUI();

  loadAnnouncements();
  loadRecentFiles();
  loadResourcesTable();

  loadReportsChart();
  loadReportsStats();
  loadReportsActivity();

  loadKnowledgeUpdates();

  handleContactForm();
});

