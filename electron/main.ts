import { app, BrowserWindow, ipcMain, Menu, MenuItem, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenerativeAI } from '@google/generative-ai'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let geminiApiKey: string | null = null

ipcMain.handle('set-gemini-key', (_, key: string) => {
  geminiApiKey = key
})

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webviewTag: true,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    width: 1200,
    height: 800,
  })

  // Handle links opening from the main window (renderer)
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Handle Context Menu for WebViews
app.on('web-contents-created', (_, contents) => {
  // Handle links opening from webviews
  contents.setWindowOpenHandler(({ url }) => {
    console.log('setWindowOpenHandler triggered with URL:', url)
    if (url.startsWith('https:') || url.startsWith('http:')) {
      console.log('Opening in external browser:', url)
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  if (contents.getType() === 'webview') {
    // Handle navigation within webview (e.g., clicking links)
    contents.on('will-navigate', (event, url) => {
      console.log('will-navigate triggered:', url)

      // Get the current URL
      const currentURL = contents.getURL()
      console.log('Current URL:', currentURL)

      // If the URL is absolute (starts with http/https), check if we should open externally
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          const currentDomain = new URL(currentURL).hostname
          const targetDomain = new URL(url).hostname

          console.log('Current domain:', currentDomain, 'Target domain:', targetDomain)

          // Open ALL external links in browser, including same-domain links that go outside the app
          // Only allow navigation if it's the initial load or to the same base path
          const isInitialLoad = !currentURL || currentURL === 'about:blank'
          const isSameDomain = currentDomain === targetDomain
          const isAppPath = isSameDomain && (
            url.includes('/client') || // Slack
            url.includes('/app') ||  // Discord
            url.includes('/k/') // Telegram
          )

          if (!isInitialLoad && !isAppPath) {
            console.log('Opening external URL in browser:', url)
            event.preventDefault()
            shell.openExternal(url)
          } else {
            console.log('Allowing navigation:', url)
          }
        } catch (err) {
          console.error('URL parsing error:', err)
        }
      }
    })

    contents.on('context-menu', (_, params) => {
      const menu = new Menu()

      if (params.selectionText && params.isEditable) {
        menu.append(new MenuItem({
          label: 'Refine with AI',
          click: async () => {
            if (!geminiApiKey) {
              console.log('No API Key set')
              return
            }

            try {
              const genAI = new GoogleGenerativeAI(geminiApiKey)
              const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

              const prompt = `Fix grammar and improve the following text, keeping it natural and concise. Return ONLY the improved text, no explanations:\n\n"${params.selectionText}"`

              const result = await model.generateContent(prompt)
              const response = result.response
              const text = response.text()

              if (text) {
                // Insert the text into the webview
                contents.insertText(text)
              }
            } catch (error) {
              console.error('Gemini Refine Error:', error)
            }
          }
        }))
        menu.append(new MenuItem({ type: 'separator' }))
      }

      menu.append(new MenuItem({ role: 'copy' }))
      menu.append(new MenuItem({ role: 'paste' }))
      menu.append(new MenuItem({ role: 'cut' }))
      menu.append(new MenuItem({ role: 'selectAll' }))

      menu.popup()
    })
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
