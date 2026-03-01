const { app, BrowserWindow, Tray, Menu, nativeImage, session, systemPreferences, dialog, shell, ipcMain, screen } = require('electron');
const path = require('path');
const { getMainText } = require('./src/i18n/main');

let mainWindow;
let tray;
let overlayWindow;
let overlayHideTimer = null;

const OVERLAY_PULSE_MS = 1200;

function mt(key) {
    return getMainText(app, key);
}

async function requestCameraPermission() {
    if (process.platform !== 'darwin') {
        return true;
    }

    const status = systemPreferences.getMediaAccessStatus('camera');

    if (status === 'granted') {
        return true;
    }

    const granted = await systemPreferences.askForMediaAccess('camera');

    if (!granted) {
        dialog.showMessageBox({
            type: 'warning',
            title: mt('cameraPermissionTitle'),
            message: mt('cameraPermissionMessage'),
            detail: mt('cameraPermissionDetail'),
            buttons: [mt('openSystemSettings'), mt('later')],
            defaultId: 0,
            cancelId: 1
        }).then((res) => {
            if (res.response === 0) {
                shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Camera');
            }
        });
    }

    return granted;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 450,
        height: 700,
        show: false, // Don't show until ready
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'src/preload.js'),
            backgroundThrottling: false // Important: Keep running in background
        },
        autoHideMenuBar: true
    });

    mainWindow.loadFile(path.join(__dirname, 'src/presentation/index.html'));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('minimize', () => {
        createTray();
    });

    // Close the app when the window is closed
    mainWindow.on('close', () => {
        app.quit();
    });
}

function getOverlayBounds() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        return screen.getDisplayMatching(mainWindow.getBounds()).bounds;
    }
    return screen.getPrimaryDisplay().bounds;
}

function ensureOverlayWindow() {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        return overlayWindow;
    }

    const bounds = getOverlayBounds();
    overlayWindow = new BrowserWindow({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        show: false,
        frame: false,
        transparent: true,
        resizable: false,
        movable: false,
        skipTaskbar: true,
        focusable: false,
        fullscreenable: false,
        alwaysOnTop: true,
        hasShadow: false,
        backgroundColor: '#00000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: false
        }
    });

    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    overlayWindow.loadFile(path.join(__dirname, 'src/presentation/overlay.html'));
    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });

    return overlayWindow;
}

function syncOverlayBounds() {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    const bounds = getOverlayBounds();
    overlayWindow.setBounds(bounds);
}

function runOverlayScript(script) {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;

    const exec = () => {
        if (!overlayWindow || overlayWindow.isDestroyed()) return;
        overlayWindow.webContents.executeJavaScript(script, true).catch(() => undefined);
    };

    if (overlayWindow.webContents.isLoadingMainFrame()) {
        overlayWindow.webContents.once('did-finish-load', exec);
        return;
    }

    exec();
}

function triggerMannerOverlay() {
    ensureOverlayWindow();
    syncOverlayBounds();

    if (!overlayWindow || overlayWindow.isDestroyed()) return;

    overlayWindow.showInactive();
    runOverlayScript('window.__triggerOverlayPulse && window.__triggerOverlayPulse();');

    if (overlayHideTimer) {
        clearTimeout(overlayHideTimer);
    }

    overlayHideTimer = setTimeout(() => {
        if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.hide();
        }
        overlayHideTimer = null;
    }, OVERLAY_PULSE_MS + 120);
}

function clearMannerOverlay() {
    if (overlayHideTimer) {
        clearTimeout(overlayHideTimer);
        overlayHideTimer = null;
    }
    if (!overlayWindow || overlayWindow.isDestroyed()) return;

    runOverlayScript('window.__clearOverlayPulse && window.__clearOverlayPulse();');
    overlayWindow.hide();
}

function createTray() {
    if (tray) return;

    const iconPath = path.join(__dirname, 'src/presentation/assets/icon.png');
    const icon = nativeImage.createFromPath(iconPath);
    
    tray = new Tray(icon);
    tray.setToolTip(mt('trayTooltip'));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: mt('trayShowApp'),
            click: () => {
                if (!mainWindow) return;
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.show();
                mainWindow.focus();
            }
        },
        { type: 'separator' },
        { label: mt('trayQuit'), click: () => app.quit() }
    ]);

    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
        if (!mainWindow) return;
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    });
}

app.whenReady().then(async () => {
    const granted = await requestCameraPermission();
    if (!granted && process.platform === 'darwin') {
        app.quit();
        return;
    }

    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === 'media' || permission === 'camera') {
            callback(true);
            return;
        }
        callback(false);
    });

    ipcMain.on('manner-overlay:trigger', triggerMannerOverlay);
    ipcMain.on('manner-overlay:clear', clearMannerOverlay);

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('before-quit', () => {
    ipcMain.removeAllListeners('manner-overlay:trigger');
    ipcMain.removeAllListeners('manner-overlay:clear');

    if (overlayHideTimer) {
        clearTimeout(overlayHideTimer);
        overlayHideTimer = null;
    }
    if (overlayWindow) {
        overlayWindow.destroy();
        overlayWindow = null;
    }

    if (tray) {
        tray.destroy();
        tray = null;
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
