const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const app = express();

app.use(express.json());
app.use(express.static("public"));

/* ===========================
   DOWNLOAD SIMPLE HTML APP
=========================== */
app.post("/download-html", (req, res) => {
  const { html, css, js } = req.body;

  const fullHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Jergan App</title>
<style>
${css}
</style>
</head>
<body>
${html}
<script>
${js}
<\/script>
</body>
</html>
`;

  res.setHeader("Content-Disposition", "attachment; filename=jergan-app.html");
  res.setHeader("Content-Type", "text/html");
  res.send(fullHTML);
});

/* ===========================
   DOWNLOAD ELECTRON DESKTOP APP
=========================== */
app.post("/download-electron", (req, res) => {
  const { html, css, js, json } = req.body;

  const zipPath = path.join(__dirname, "temp.zip");
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    res.download(zipPath, "jergan-desktop-app.zip", () => {
      fs.unlinkSync(zipPath);
    });
  });

  archive.pipe(output);

  /* ===== index.html ===== */
  archive.append(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Jergan Desktop App</title>
<style>
${css}
</style>
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

  /* ===== main.js ===== */
  archive.append(`
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: path.join(__dirname, 'JVEAI.ico')
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
`, { name: "main.js" });

  /* ===== package.json ===== */
  archive.append(`
{
  "name": "jergan-desktop-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
