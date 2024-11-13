const { contextBridge, ipcRenderer } = require("electron");
const os = require("os");
const path = require("path");
const Toastify = require("toastify-js");
const { Buffer } = require("buffer");

contextBridge.exposeInMainWorld("os", {
  homedir: os.homedir(),
});

contextBridge.exposeInMainWorld("path", {
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld("Toastify", {
  toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld("Buffer", {
  from: (buffer) => Buffer.from(buffer),
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, fn) => ipcRenderer.on(channel, (event, ...args) => fn(...args)),
});
