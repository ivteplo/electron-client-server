//
// © 2025 Ivan Teplov.
// Licensed under the Apache license 2.0
//

import express from "express"

export const server = express()

server.get("/api/ping", (request, response) => {
	response.setHeader("Content-Type", "text/html")
	response.send("Pong")
})
