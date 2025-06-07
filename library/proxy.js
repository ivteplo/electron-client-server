//
// © 2025 Ivan Teplov.
// Licensed under the Apache license 2.0
//

import inject from "light-my-request"
import { protocol } from "electron"

import { emulateRequest } from "./emulate.js"

/**
 * Create a proxy to handle requests to an emulated server.
 * @param {URL} baseURL - URL at which the emulated server is available for the frontend.
 * @param {inject.DispatchFunc} server - server to emulate.
 * @returns {(request: Request) => Promise<Response>} - proxy to pass to the `protocol.handle` method from electron.
 */
export function createProxy(baseURL, server) {
	return request => {
		const url = new URL(request.url)

		// If the host doesn’t match our base URL:
		if (url.hostname !== baseURL.hostname) {
			// Simply send the request.
			return fetch(request)
		}

		// Otherwise we want to emulate the request.
		return emulateRequest({ server, baseURL, url, request })
	}
}

/**
 * Apply a proxy to handle requests to an emulated server.
 * @param {URL} baseURL - URL at which the emulated server is available for the frontend.
 * @param {inject.DispatchFunc} server - server to emulate.
 * @returns {void}
 */
export function applyProxy(baseURL, server) {
	// Register our proxy
	protocol.handle(
		// We do not want the ‘:’ at the end
		baseURL.protocol.slice(0, -1),
		createProxy(baseURL, server)
	)
}
