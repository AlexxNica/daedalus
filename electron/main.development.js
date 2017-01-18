import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from 'electron';
import osxMenu from './menus/osx';
import winLinuxMenu from './menus/win-linux';

let menu;
let mainWindow = null;
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  require('electron-debug')(); // eslint-disable-line global-require
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const installExtensions = async () => {
  if (isDev) {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {
      } // eslint-disable-line
    }
  }
};

app.on('ready', async () => {
  await installExtensions();

  mainWindow = new BrowserWindow({
    show: false,
    width: 1150,
    height: 870
    // TODO: revert to 480 x 757 when reintroducing login
  });

  mainWindow.loadURL(`file://${__dirname}/../app/index.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  ipcMain.on('resize-window', (event, { width, height, animate }) => {
    if (event.sender !== mainWindow.webContents) return;
    mainWindow.setSize(width, height, animate);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) mainWindow.openDevTools();

  mainWindow.webContents.on('context-menu', (e, props) => {
    const { x, y } = props;

    Menu.buildFromTemplate([{
      label: 'Inspect element',
      click() {
        mainWindow.inspectElement(x, y);
      }
    }]).popup(mainWindow);
  });

  if (process.platform === 'darwin') {
    menu = Menu.buildFromTemplate(osxMenu(app, mainWindow));
    Menu.setApplicationMenu(menu);
  } else {
    menu = Menu.buildFromTemplate(winLinuxMenu(mainWindow));
    mainWindow.setMenu(menu);
  }
});
