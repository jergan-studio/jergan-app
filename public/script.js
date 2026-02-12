function showTab(tab) {
  document.querySelectorAll(".editor").forEach(e => e.classList.add("hidden"));
  document.getElementById(tab).classList.remove("hidden");
}

function updatePreview() {
  const html = document.getElementById("html").value;
  const css = document.getElementById("css").value;
  const js = document.getElementById("js").value;

  const preview = document.getElementById("preview");
  const doc = preview.contentDocument || preview.contentWindow.document;

  doc.open();
  doc.write(`
    <style>${css}</style>
    ${html}
    <script>${js}<\/script>
  `);
  doc.close();
}

function downloadApp() {
  const html = document.getElementById("html").value;
  const css = document.getElementById("css").value;
  const js = document.getElementById("js").value;

  const full = `
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

  const blob = new Blob([full], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "jergan-app.html";
  a.click();
}
