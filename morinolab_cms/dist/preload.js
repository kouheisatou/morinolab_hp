"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    getContentTypes: () => electron_1.ipcRenderer.invoke('get-content-types'),
    getItems: (type) => electron_1.ipcRenderer.invoke('get-items', type),
    createItem: (type) => electron_1.ipcRenderer.invoke('create-item', type),
    deleteItem: (type, id) => electron_1.ipcRenderer.invoke('delete-item', type, id),
    loadContent: (type, id) => electron_1.ipcRenderer.invoke('load-content', type, id),
    saveContent: (type, id, content) => electron_1.ipcRenderer.send('save-content', type, id, content),
    saveImage: (type, id, sourcePath, fileName) => electron_1.ipcRenderer.invoke('save-image', type, id, sourcePath, fileName),
    getTableData: (type) => electron_1.ipcRenderer.invoke('get-table-data', type),
    updateCell: (type, id, column, value) => electron_1.ipcRenderer.invoke('update-cell', type, id, column, value),
    selectThumbnail: (type, id) => electron_1.ipcRenderer.invoke('select-thumbnail', type, id),
    resolvePath: (type, rel) => electron_1.ipcRenderer.invoke('resolve-path', type, rel),
    getFontURL: () => electron_1.ipcRenderer.invoke('get-font-url'),
});
