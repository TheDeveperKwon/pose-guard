const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopOverlay', {
    trigger: () => {
        ipcRenderer.send('manner-overlay:trigger');
    },
    clear: () => {
        ipcRenderer.send('manner-overlay:clear');
    }
});
