const {app, BrowserWindow, dialog, ipcMain} = require('electron')
const path = require('path')

async function handleFileOpen() {
    const {canceled, filePaths} = await dialog.showOpenDialog(
        BrowserWindow.getFocusedWindow(),
        {
            title: "选择要转换格式的视频文件",
            properties: ["openFile", "multiSelections", "dontAddToRecent"],
            filters: [{
                name: "Movies", extensions: ["ts", "mkv", "mov", "wmv", "webm", "m4v",
                    "m4a", "avi", "mpeg", "flv", "ogg", "rmvb"]
            }],
        }
    );
    if (canceled) {
        return "";
    } else {
        return filePaths;
    }
}

function createWindow() {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        width: 443,
        height: 390,
        resizable: false,
        minimizable: false,
        maximizable: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true, //引入node和electron相关的API
            enableRemoteModule: true, // 可以使用remote方法
            preload: path.resolve(__dirname, "preload.js"),
        },
    })
    win.loadFile(path.resolve(__dirname, 'index.html')).then()
}

app.whenReady().then(() => {
    ipcMain.removeHandler("dialog:myOpenFile");
    ipcMain.handle("dialog:myOpenFile", handleFileOpen);
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
