//
// © 2025 Ivan Teplov.
// Licensed under the Apache license 2.0
//

import { app, BrowserWindow } from "electron"

import { applyProxy } from "../library/index.js"
import { server } from "./server.js"

const baseURL = new URL("http://example-app.local/")

function createMainWindow() {
	const window = new BrowserWindow()
	const url = new URL("./api/ping", baseURL)
	window.loadURL(url.toString())
}

function onAppReady() {
	applyProxy(baseURL, server)
	createMainWindow()
}

function onAllWindowsClosed() {
	if (process.platform !== "darwin") {
		app.quit()
	}
}

function onActivated() {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow()
	}
}

app.whenReady().then(onAppReady).catch(console.error)
app.on("window-all-closed", onAllWindowsClosed)
app.on("activate", onActivated)
