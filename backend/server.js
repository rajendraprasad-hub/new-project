const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve frontend from public
app.use(express.static(path.join(__dirname, "../public")));

// Serve docs for download/view
app.use("/docs", express.static(path.join(__dirname, "../docs")));

// API: Return all files inside docs/
app.get("/api/files", (req, res) => {
  const docsPath = path.join(__dirname, "../docs");

  fs.readdir(docsPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to read docs folder" });
    }

    const data = files.map((file) => {
      const ext = path.extname(file).toLowerCase().replace(".", "");
      return {
        fileName: file,
        type: ext,
        url: `/docs/${file}`
      };
    });

    res.json(data);
  });
});

// API: Contact form (for now only prints to console)
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  console.log("✅ Contact Form Received:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Message:", message);

  res.status(200).json({ status: "Message received successfully" });
});

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Portal running at: http://localhost:${PORT}`);
});

