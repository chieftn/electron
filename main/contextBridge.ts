import { contextBridge, ipcRenderer } from 'electron';
import { AccountInfo } from '@azure/msal-node';
import { MessageChannels } from './constants';

console.log('doing things');
contextBridge.exposeInMainWorld('electron', {

    sayHello: async (): Promise<string> => {
        const result = await ipcRenderer.invoke(MessageChannels.hello);
        return result;
    },

    getAccount: async (): Promise<AccountInfo | undefined> => {
        const account = await ipcRenderer.invoke(MessageChannels.account);
        return account;
    },

    getProfileToken: async (): Promise<string> => {
        const token = await ipcRenderer.invoke(MessageChannels.profileToken);
        return token;
    },

    login: async (): Promise<void> => {
        await ipcRenderer.invoke(MessageChannels.login);
    },

    logout: async (): Promise<void> => {
        await ipcRenderer.invoke(MessageChannels.logout);
    }
})