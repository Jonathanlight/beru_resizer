const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

// Disable GPU acceleration issues on some systems
app.commandLine.appendSwitch('disable-gpu-sandbox')

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 900,
    minHeight: 650,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0f0f13',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for sharp in preload
    },
  })

  // Dev or production URL
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// --- IPC Handlers ---

// Window controls
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window:close', () => mainWindow?.close())

// Open file dialog to select images
ipcMain.handle('dialog:openImages', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'avif'] },
    ],
  })
  if (result.canceled) return []
  return result.filePaths
})

// Select output directory
ipcMain.handle('dialog:selectOutputDir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

// Get image metadata (dimensions, size, format)
ipcMain.handle('image:getInfo', async (_event, filePath) => {
  try {
    const stats = fs.statSync(filePath)
    const metadata = await sharp(filePath).metadata()
    return {
      path: filePath,
      name: path.basename(filePath),
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
    }
  } catch (err) {
    return { error: err.message, path: filePath }
  }
})

// Get base64 thumbnail for preview
ipcMain.handle('image:getThumbnail', async (_event, filePath) => {
  try {
    const buffer = await sharp(filePath)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .toFormat('jpeg', { quality: 80 })
      .toBuffer()
    return `data:image/jpeg;base64,${buffer.toString('base64')}`
  } catch (err) {
    return null
  }
})

// Resize images batch
ipcMain.handle('image:resize', async (_event, { files, options }) => {
  const {
    mode,          // 'percentage' | 'dimensions'
    percentage,    // number (e.g. 50 for 50%)
    width,         // target width
    height,        // target height
    keepAspect,    // boolean
    outputDir,     // output directory path
    format,        // 'original' | 'jpeg' | 'png' | 'webp'
  } = options

  // Ensure output directory exists
  const outDir = outputDir || path.join(path.dirname(files[0].path), 'output')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const results = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      let pipeline = sharp(file.path)
      const metadata = await pipeline.metadata()

      // Calculate target dimensions
      let targetW, targetH

      if (mode === 'percentage') {
        const scale = percentage / 100
        targetW = Math.round(metadata.width * scale)
        targetH = Math.round(metadata.height * scale)
      } else {
        targetW = width || undefined
        targetH = height || undefined
      }

      // Apply resize
      pipeline = pipeline.resize(targetW, targetH, {
        fit: keepAspect ? 'inside' : 'fill',
        withoutEnlargement: false,
      })

      // Determine output format
      const ext = path.extname(file.name).toLowerCase()
      let outputExt = ext
      if (format && format !== 'original') {
        outputExt = `.${format}`
        pipeline = pipeline.toFormat(format, {
          quality: format === 'jpeg' ? 90 : undefined,
        })
      }

      const outputName = `${path.basename(file.name, ext)}_resized${outputExt}`
      const outputPath = path.join(outDir, outputName)

      const info = await pipeline.toFile(outputPath)

      const outputStats = fs.statSync(outputPath)

      results.push({
        success: true,
        originalName: file.name,
        outputPath,
        outputName,
        newWidth: info.width,
        newHeight: info.height,
        newSize: outputStats.size,
        originalSize: file.size,
      })

      // Send progress to renderer
      mainWindow?.webContents.send('resize:progress', {
        current: i + 1,
        total: files.length,
        fileName: file.name,
      })
    } catch (err) {
      results.push({
        success: false,
        originalName: file.name,
        error: err.message,
      })
      mainWindow?.webContents.send('resize:progress', {
        current: i + 1,
        total: files.length,
        fileName: file.name,
        error: err.message,
      })
    }
  }

  return results
})

// Open directory in file explorer
ipcMain.handle('shell:openPath', async (_event, dirPath) => {
  const { shell } = require('electron')
  await shell.openPath(dirPath)
})
