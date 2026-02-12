const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/download-html", (req, res) => {
  const { html, css, js } = req.body;

  const fullHTML = `
<!DOCTYPE html>
<html>
<head>
<style>${css}</style>
</head>
<body>
${html}
<script>${js}<\/script>
</body>
</html>
`;

  res.setHeader("Content-Disposition", "attachment; filename=jergan-app.html");
  res.setHeader("Content-Type", "text/html");
  res.send(fullHTML);
});

app.post("/download-electron", (req, res) => {
  const { html, css, js, json } = req.body;

  const outputPath = path.join(__dirname, "temp.zip");
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip");

  output.on("close", () => {
    res.download(outputPath, "jergan-desktop-app.zip", () => {
      fs.unlinkSync(outputPath);
    });
  });

  archive.pipe(output);

  // index.html
  archive.append(`
<!DOCTYPE html>
<html>
<head>
<style>${css}</style>
</head>
<body>
${html}
<script>
const appData = ${json};
${js}
<\/script>
</body>
</html>
`, { name: "index.html" });

  // main.js
  archive.append(`
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
`, { name: "main.js" });

  // package.json
  archive.append(`
{
  "name": "jergan-desktop-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  },
  "devDependencies": {
    "electron": "^28.0.0"
  }
}
`, { name: "package.json" });

  archive.finalize();
});

app.listen(3000, () => {
  console.log("🔥 Jergan App running at http://localhost:3000");
});
