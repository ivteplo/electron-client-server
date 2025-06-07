//
// © 2025 Ivan Teplov.
// Licensed under the Apache license 2.0
//

import express from "express"
import url from "node:url"

export const server = express()

// Make files in the `static/` folder available to the client
const staticFilesPath = url.fileURLToPath(new URL("./static/", import.meta.url))
server.use(express.static(staticFilesPath))

// GET /ping — returns "Pong" as the response.
server.get("/api/ping", (request, response) => {
	response.setHeader("Content-Type", "text/html")
	response.send("Pong")
})

// A Promise-based version of `setTimeout`.
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// GET /api/sse
// Sends the current time (`Date.now()`) to the client
// using the Server-Sent Events approach.
server.get("/api/sse", async (request, response) => {
	// We need to use `writeHead` or `flushHeaders`
	// in order to complete the setup.
	response.writeHead(200, {
		"Cache-Control": "no-cache",
		"Content-Type": "text/event-stream",
		"Connection": "keep-alive",
	})

	// We don’t want to send new events if the request is closed.
	let closed = false
	request.on("close", () => {v closed = true })

	// While the request is not closed,
	// wait for one second and send the current time.
	while (!closed) {
		await sleep(1000)

		const now = Date.now()
		response.write(`data: ${now}\n\n`)
	}

	// Once the request is closed, the server won’t send more events.
	response.end()
})
