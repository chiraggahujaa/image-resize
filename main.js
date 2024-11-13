const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("node:path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1200 : 600,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));

  // Open the DevTools.
  if (isDev) mainWindow.webContents.openDevTools();
};

// Create about window
const createAboutWindow = () => {
  // Create the browser window.
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: isDev ? 1200 : 600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  aboutWindow.loadFile(path.join(__dirname, "renderer/about.html"));
};

// App is Ready
app.whenReady().then(() => {
  createWindow();

  // Implement Menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Remove mainWindow from memory on close
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Menu Template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ label: "About", click: () => createAboutWindow() }],
        },
      ]
    : []),
  { role: "fileMenu" },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [{ label: "About", click: () => createAboutWindow() }],
        },
      ]
    : []),
];

ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageresizer");
  options.imageBuffer = Buffer.from(options.imageBuffer);
  resizeImage(options);
});

async function resizeImage({ imageBuffer, imageName, width, height, dest }) {
  try {
    console.log("resizing image...", imageBuffer);
    const newPath = await resizeImg(imageBuffer, {
      width: +width,
      height: +height,
    });

    // create file name
    const fileName = imageName;

    // create dest folder if does not exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // write file to dest
    fs.writeFileSync(path.join(dest, fileName), newPath);

    // send success message
    mainWindow.webContents.send("image:done");

    // open destination folder
    shell.openPath(dest);
  } catch (err) {
    console.error(err);
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
