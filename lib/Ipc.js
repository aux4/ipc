const { ipcRenderer } = require("electron");

class Ipc {
  static call(senderChannel, ...args) {
    const uuid = generateUUID();

    return new Promise(resolve => {
      ipcRenderer.on(`${senderChannel}-RESPONSE-${uuid}`, (event, response) => {
        resolve(response);
      });

      try {
        ipcRenderer.send(senderChannel, uuid, ...args);
      } catch (e) {
        throw new Error(`Error sending message to channel ${senderChannel}: ${e.message}`);
      }
    });
  }

  static trigger(senderChannel, ...args) {
    const uuid = generateUUID();

    return new Promise(resolve => {
      try {
        ipcRenderer.send(senderChannel, uuid, ...args);
        resolve();
      } catch (e) {
        throw new Error(`Error sending message to channel ${senderChannel}: ${e.message}`);
      }
    });
  }
}

function generateUUID() {
  return "xxxxyyyy".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

module.exports = Ipc;
