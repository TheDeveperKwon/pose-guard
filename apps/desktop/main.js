const { app, BrowserWindow, Tray, Menu, nativeImage, session, systemPreferences, dialog, shell } = require('electron');
const path = require('path');

let mainWindow;
let tray;

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
            title: '카메라 권한 필요',
            message: 'PoseGuard Lite 카메라 접근이 허용되지 않았습니다.',
            detail: '메뉴에서 macOS 보안 설정의 카메라 권한을 허용해 주세요.',
            buttons: ['시스템 설정 열기', '나중에'],
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

function createTray() {
    if (tray) return;

    const iconPath = path.join(__dirname, 'src/presentation/assets/icon.png');
    const icon = nativeImage.createFromPath(iconPath);
    
    tray = new Tray(icon);
    tray.setToolTip('PoseGuard Lite');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                if (!mainWindow) return;
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.show();
                mainWindow.focus();
            }
        },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
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

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('before-quit', () => {
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
