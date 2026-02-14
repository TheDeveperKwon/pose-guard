const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray;

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

    // Close the app when the window is closed
    mainWindow.on('close', () => {
        app.quit();
    });
}

function createTray() {
    // Load icon. If not exists, Tray might fail or show empty. 
    // Ideally we need an icon file.
    const iconPath = path.join(__dirname, 'src/presentation/assets/icon.png');
    // Simple check or try/catch won't help much with native image load.
    // If image is empty, it might be invisible.
    
    // Create a simple empty native image or try to load.
    // For now, let's assume the asset will be created.
    const icon = nativeImage.createFromPath(iconPath);
    
    tray = new Tray(icon);
    tray.setToolTip('PoseGuard Lite');

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: () => mainWindow.show() },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    ]);

    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
