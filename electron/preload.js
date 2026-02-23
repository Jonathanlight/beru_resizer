const { contextBridge, ipcRenderer } = require('electron')

// Expose a secure API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // File dialogs
  openImages: () => ipcRenderer.invoke('dialog:openImages'),
  selectOutputDir: () => ipcRenderer.invoke('dialog:selectOutputDir'),

  // Image operations
  getImageInfo: (filePath) => ipcRenderer.invoke('image:getInfo', filePath),
  getImageThumbnail: (filePath) => ipcRenderer.invoke('image:getThumbnail', filePath),
  resizeImages: (params) => ipcRenderer.invoke('image:resize', params),

  // Progress listener
  onResizeProgress: (callback) => {
    const handler = (_event, data) => callback(data)
    ipcRenderer.on('resize:progress', handler)
    return () => ipcRenderer.removeListener('resize:progress', handler)
  },

  // Shell
  openPath: (dirPath) => ipcRenderer.invoke('shell:openPath', dirPath),

  // Platform info
  platform: process.platform,
})
