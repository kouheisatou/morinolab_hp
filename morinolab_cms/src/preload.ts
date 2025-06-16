import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getContentTypes: (): Promise<string[]> => ipcRenderer.invoke('get-content-types'),
  getItems: (type: string): Promise<Array<{ id: string; title: string }>> => ipcRenderer.invoke('get-items', type),
  createItem: (type: string): Promise<{ id: string; title: string }> => ipcRenderer.invoke('create-item', type),
  deleteItem: (type: string, id: string): Promise<void> => ipcRenderer.invoke('delete-item', type, id),
  loadContent: (type: string, id: string): Promise<string> => ipcRenderer.invoke('load-content', type, id),
  saveContent: (type: string, id: string, content: string): void => ipcRenderer.send('save-content', type, id, content),
  saveImage: (type: string, id: string, sourcePath: string, fileName: string): Promise<string | null> => ipcRenderer.invoke('save-image', type, id, sourcePath, fileName),
});

declare global {
  interface Window {
    api: {
      getContentTypes(): Promise<string[]>;
      getItems(type: string): Promise<Array<{ id: string; title: string }>>;
      createItem(type: string): Promise<{ id: string; title: string }>;
      deleteItem(type: string, id: string): Promise<void>;
      loadContent(type: string, id: string): Promise<string>;
      saveContent(type: string, id: string, content: string): void;
      saveImage(type: string, id: string, sourcePath: string, fileName: string): Promise<string | null>;
    };
  }
} 