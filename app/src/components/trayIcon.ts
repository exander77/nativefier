import { app, Tray, Menu, ipcMain, nativeImage, BrowserWindow } from 'electron';

import { getAppIcon, getCounterValue } from '../helpers/helpers';

export function createTrayIcon(
  nativefierOptions,
  mainWindow: BrowserWindow,
): Tray {
  const options = { ...nativefierOptions };

  if (options.tray) {
    const iconPath = getAppIcon();
    const nimage = nativeImage.createFromPath(iconPath);
    const appIcon = new Tray(nimage);

    const onClick = () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    };

    const contextMenu = Menu.buildFromTemplate([
      {
        label: options.name,
        click: onClick,
      },
      {
        label: 'Quit',
        click: app.exit.bind(this),
      },
    ]);

    appIcon.on('click', onClick);

    if (options.counter) {
      mainWindow.on('page-title-updated', (e, title) => {
        const counterValue = getCounterValue(title);
        if (counterValue) {
          appIcon.setToolTip(`(${counterValue})  ${options.name}`);
          // @ts-ignore
          const nimage = nativeImage.createFromPath(iconPath.replace(/(.*)\/.*(\.png$)/i, '$1/icon-notify-' + Math.min(counterValue, 10) + '$2'));
          appIcon.setImage(nimage);
        } else {
          appIcon.setToolTip(options.name);
          const nimage = nativeImage.createFromPath(iconPath);
          appIcon.setImage(nimage);
        }
      });
    } else {
      let counterValue = 0;

      ipcMain.on('notification', () => {
        if (mainWindow.isFocused()) {
          return;
        }
        appIcon.setToolTip(`•  ${options.name}`);
        counterValue = Math.min(counterValue + 1, 10);
        const nimage = nativeImage.createFromPath(iconPath.replace(/(.*)\/.*(\.png$)/i, '$1/icon-notify-' + counterValue + '$2'));
        appIcon.setImage(nimage);
      });

      mainWindow.on('focus', () => {
        appIcon.setToolTip(options.name);
        counterValue = 0;
        const nimage = nativeImage.createFromPath(iconPath);
        appIcon.setImage(nimage);
      });
    }

    appIcon.setToolTip(options.name);
    appIcon.setContextMenu(contextMenu);

    return appIcon;
  }

  return null;
}
