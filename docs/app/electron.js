// public/electron.js
// Main process entry for Electron when using CRA + electron-builder react-cra preset.

const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

const isDev = !app.isPackaged;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (isDev) {
    // In development, load the CRA dev server
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // In production, load the built index.html in /build
    mainWindow.loadURL(
      `file://${path.join(__dirname, "index.html")}`
    );
  }
}

function registerAutoUpdates() {
  if (isDev) {
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-downloaded", () => {
    if (!mainWindow) {
      return;
    }

    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        buttons: ["Install now", "Later"],
        defaultId: 0,
        cancelId: 1,
        title: "Update ready",
        message: "A new version has been downloaded.",
        detail: "Restart to install now or choose Later to finish when you quit.",
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on("error", (error) => {
    console.error("Auto update failed:", error);
  });
}

app.whenReady().then(() => {
  createWindow();
  registerAutoUpdates();

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify().catch((error) => {
      console.error("Auto update check failed:", error);
    });
  }

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
