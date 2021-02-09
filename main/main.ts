import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { AccountInfo } from '@azure/msal-node';
import { MessageChannels } from './constants';
import { AuthProvider } from './authProvider';

const target = path.join(__dirname, '../target/index.html');

export default class Main {
    static application: Electron.App;
    static mainWindow: Electron.BrowserWindow;
    static authProvider: AuthProvider;
    static accessToken: string;

    static main(): void {
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
        Main.application.on('web-contents-created', (event, contents) => {
            contents.on('will-navigate', (event, navigationUrl) => {
              const parsedUrl = new URL(navigationUrl)
              console.log('parsedUrl: ' + parsedUrl);

            //   if (parsedUrl.origin !== 'https://example.com') {
            //     event.preventDefault()
            //   }
            })
          })
    }

    private static async loadTarget(redirect?: string): Promise<void> {
        this.mainWindow.loadFile(target, { query: {redirect: redirect || ''} });
    }

    private static onWindowAllClosed(): void {
        Main.application.quit();
    }

    private static onClose(): void {
        Main.mainWindow = null;
    }

    private static createMainWindow(): void {
        this.mainWindow = new BrowserWindow({
            width: 800,
            height: 800,
            webPreferences: {
                nodeIntegration: false, // is default value after Electron v5
                contextIsolation: true, // protect against prototype pollution
                enableRemoteModule: false, // turn off remote
                preload: __dirname  + '/contextBridge.js' // use a preload script
            },
        });
    }

    private static onReady(): void {
        Main.createMainWindow();
        Main.mainWindow.loadFile(target);
        Main.mainWindow.on('closed', Main.onClose);
        Main.authProvider = new AuthProvider();
        Main.registerMessageChannels();
    }

    private static registerMessageChannels(): void {
        ipcMain.handle(MessageChannels.hello, this.onHello);
        ipcMain.handle(MessageChannels.login, this.onLogin);
        ipcMain.handle(MessageChannels.logout, this.onLogout);
        ipcMain.handle(MessageChannels.account, this.onAccount);
        ipcMain.handle(MessageChannels.profileToken, this.onProfileToken);
    }

    private static async onProfileToken(): Promise<string> {
        const token = await Main.authProvider.getProfileToken(Main.mainWindow);
        return token;
    };

    private static async onAccount(): Promise<AccountInfo | undefined> {
        const account = await Main.authProvider.currentAccount;
        return account;
    }

    private static async onLogin(): Promise<void> {
        await Main.authProvider.login(Main.mainWindow)
        await Main.loadTarget();
    }

    private static async onLogout(): Promise<void> {
        await Main.authProvider.logout();
        await Main.loadTarget();
    }


    private static async onHello(event: Electron.IpcMainInvokeEvent, ...args: any[]): Promise<string> {
        return 'hello';
    }
}
