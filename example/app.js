//
// © 2025 Ivan Teplov.
// Licensed under the Apache license 2.0
//

import { app, BrowserWindow } from "electron"

import { applyProxy } from "../library/index.js"
import { server } from "./server.js"

// There are two examples available:
// • a minimal one (ping)
// • one using Server-Sent Events (sse)
const example = process.argv?.[2] ?? "ping"

// This is the URL that our "server" will be available at
const baseURL = new URL("http://example-app.local/")

function createMainWindow() {
	const window = new BrowserWindow()

	// Load the right URL based on the argument passed to the script
	const url = example === "ping"
		? new URL("./api/ping", baseURL)
		: new URL("./index.html", baseURL)

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
