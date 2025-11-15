// public/electron.js
// Main process entry for Electron when using CRA + electron-builder react-cra preset.

const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (isDev) {
    // In development, load the CRA dev server
    win.loadURL("http://localhost:3000");
  } else {
    // In production, load the built index.html in /build
    win.loadURL(
      `file://${path.join(__dirname, "index.html")}`
    );
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
