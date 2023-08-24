const { ipcMain } = require("electron");

class IpcController {
  constructor(mapping = {}) {
    this.mapping = mapping;
  }

  setupIpcListeners(win, ...params) {
    const ipcMapping = this.mapping;

    Object.keys(ipcMapping).forEach(eventType => {
      ipcMain.on(eventType, async (event, ipcUUID, ...args) => {
        if (win.isDestroyed() || event.sender.id !== win.webContents.id) return;

        try {
          const response = await ipcMapping[eventType](win, { event, ...params }, ...args);
          win.webContents.postMessage(`${eventType}-RESPONSE-${ipcUUID}`, response);
        } catch (e) {
          throw new Error(`Error executing event ${eventType}: ${e.message}`);
        }
      });
    });
  }
}

module.exports = IpcController;
