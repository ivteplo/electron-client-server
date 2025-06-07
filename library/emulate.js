//
// © 2025 Ivan Teplov.
// Licensed under the Apache license 2.0
//

// To emulate a request to the back end
import inject from "light-my-request"

const cacheDisablingHeaders = {
	"Cache-Control": "no-cache, no-store, must-revalidate",
	"Pragma": "no-cache",
	"Expires": 0,
	"If-None-Match": null
}

/**
 * @param {object} params
 * @param {inject.DispatchFunc} params.server
 * @param {URL} params.baseURL
 * @param {URL} params.url
 * @param {Request} params.request
 */
export async function emulateRequest({ server, baseURL, url, request }) {
	// This function call simply emulates the request.
	const response = await inject(server, {
		method: request.method,
		url: request.url,
		query: url.search,
		remoteAddress: new URL("/", baseURL).toString(),
		body: Buffer.from(await request.arrayBuffer()),

		// We need to convert request headers to the right format
		headers: {
			...Object.fromEntries([...request.headers]),
			// We don’t want to cache the result, because creating
			// a Response object with status code “304 Not Modified”
			// would throw an error.
			...cacheDisablingHeaders
		},

		// the response will be streamed and not accumulated
		// (needed for Server-Sent Events)
		payloadAsStream: true,

		// allows to abort the request
		signal: request.signal
	}).end()

	// There is no "close" event being emitted
	// when we call EventSource.close().
	// That is why we emit an abort event as a workaround.
	// Otherwise the server might be stuck in an infinite loop.
	const responseStream = response.stream()
	responseStream.prependListener("close", () => {
		request.signal.dispatchEvent(new Event("abort"))
	})

	// Convert the response to a Node.js’ Response object.
	const nativeResponse = new Response(responseStream, {
		headers: response.headers,
		status: response.statusCode,
		statusText: response.statusMessage
	})

	return nativeResponse
}
