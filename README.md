# ipc
IPC Function Mapping for Electron

## Install

```
npm install @aux4/ipc
```

## Usage

electron.js
```javascript
async function destroyWindowIpcExecutor(win) {
  win.destroy();
}

async function openFileDialogIpcExecutor(win) {
  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile", "multiSelections"]
  });

  return {
    path: result.filePaths
  };
}

async function readFileIpcExecutor(win, context, path) {
  const file = await fsp.readFile(path, { encoding: "utf8" });

  win.title = path.split("/").pop();
  return {
    content: JSON.parse(file)
  };
}

const mapping = {
  DESTROY_WINDOW: destroyWindowIpcExecutor,
  OPEN_FILE_DIALOG: openFileDialogIpcExecutor,
  READ_FILE: readFileIpcExecutor
};

const ipcController = new IpcController(mapping);

const win = new BrowserWindow({
  // ...
  webPreferences: {
    // ...
    preload: path.join(__dirname, "preload.js")
  }
});
ipcController.setupIpcListeners(win);
```

preload.js
```javascript
contextBridge.exposeInMainWorld("electron", {
  closeWindow: async () => {
    await Ipc.trigger("DESTROY_WINDOW");
  },

  openFileDialog: async () => {
    return await Ipc.call("OPEN_FILE_DIALOG");
  },

  readFile: async (path) => {
    return await Ipc.call("READ_FILE", path);
  }
});
```

renderer.js
```javascript
const { electron } = window;

electron.closeWindow();

const { path } = await electron.openFileDialog();

const { content } = await electron.readFile("/path/to/file");
```