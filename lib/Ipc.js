const { ipcRenderer } = require("electron");

class Ipc {
  static call(senderChannel, ...args) {
    const uuid = generateUUID();

    return new Promise((resolve, reject) => {
      ipcRenderer.on(`${senderChannel}-RESPONSE-${uuid}`, (event, response) => {
        if (response instanceof Error) {
          reject(response);
          return;
        }
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

  static proxy(senderChannel, objectInterface) {
    const proxy = new Proxy(
      {},
      {
        get(target, property) {
          return (...args) => {
            return Ipc.call(senderChannel, property, ...args);
          };
        }
      }
    );

    if (!objectInterface) {
      return proxy;
    }

    const proxyDelegator = {};

    if (Array.isArray(objectInterface)) {
      objectInterface.forEach(functionName => {
        proxyDelegator[functionName] = async function (...args) {
          return await proxy[functionName](...args);
        };
      });
    } else {
      Object.keys(objectInterface).forEach(functionName => {
        proxyDelegator[functionName] = async function (...args) {
          return await proxy[functionName](...args);
        };
      });
    }

    return proxyDelegator;
  }

  static delegate(delegator) {
    return async function (win, context, property, ...args) {
      return await delegator[property](...args);
    };
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
