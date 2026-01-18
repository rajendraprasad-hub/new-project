// ================================
// Infosys Portal - Frontend Script
// ================================

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
  type = type.toLowerCase();

  if (type === "pdf") return "assets/pdf-icon.svg";
  if (type === "xlsx" || type === "xls") return "assets/excel-icon.svg";
  if (type === "pptx" || type === "ppt") return "assets/ppt-icon.svg";

  return "assets/doc-icon.svg";
}

// ✅ File Type text
function getTypeText(type) {
  return type.toUpperCase();
}

// ✅ Description mapping
function getDescription(type) {
  type = type.toLowerCase();

  if (type === "pdf") return "PDF Document";
  if (type === "xlsx" || type === "xls") return "Excel File";
  if (type === "pptx" || type === "ppt") return "Presentation File";

  return "Document File";
}

// ================================
// ✅ HOME PAGE: Recent Files
// ================================
async function loadRecentFiles() {
  const recentBox = document.getElementById("recentFilesBox");
  if (!recentBox) return;

  const files = await fetchFiles();

  if (files.length === 0) {
    recentBox.innerHTML = `<p class="small-text">No files uploaded yet.</p>`;
    return;
  }

  // Show top 5 files (simple recent list)
  const recentFiles = files.slice(0, 5);

  let html = "<ul style='padding-left:18px;'>";
  recentFiles.forEach((f) => {
    html += `
      <li style="margin:10px 0;">
        <a class="btn btn-secondary" href="${f.url}" target="_blank">
          ${f.fileName}
        </a>
      </li>`;
  });
  html += "</ul>";

  recentBox.innerHTML = html;
}

// ================================
// ✅ RESOURCES PAGE: Table + Search
// ================================
async function loadResourcesTable() {
  const tableBody = document.getElementById("filesTableBody");
  const searchInput = document.getElementById("searchInput");

  if (!tableBody) return;

  const files = await fetchFiles();

  function render(data) {
    tableBody.innerHTML = "";

    if (data.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4">No matching files found.</td>
        </tr>`;
      return;
    }

    data.forEach((f) => {
      const icon = getIcon(f.type);
      const typeText = getTypeText(f.type);
      const desc = getDescription(f.type);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${f.fileName}</strong></td>

        <td>
          <div class="file-type">
            <img src="${icon}" alt="${typeText}">
            ${typeText}
          </div>
        </td>

        <td>${desc}</td>

        <td>
          <a class="btn" href="${f.url}" target="_blank">View / Download</a>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  // Initial render
  render(files);

  // Search filter
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase();
      const filtered = files.filter((f) =>
        f.fileName.toLowerCase().includes(q)
      );
      render(filtered);
    });
  }
}

// ================================
// ✅ REPORTS PAGE: Simple Graph
// ================================
function loadReportsChart() {
  const canvas = document.getElementById("healthChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Dummy data
  const cpu = [20, 35, 50, 40, 60, 55];
  const memory = [30, 45, 55, 60, 70, 80];

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw axes
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

  drawLine(cpu, "#0033a0");    // CPU
  drawLine(memory, "#007acc"); // Memory

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
      message: form.message.value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
// ✅ Run based on page
// ================================
document.addEventListener("DOMContentLoaded", () => {
  loadRecentFiles();
  loadResourcesTable();
  loadReportsChart();
  handleContactForm();
});

