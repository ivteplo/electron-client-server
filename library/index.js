//
// © 2025 Ivan Teplov.
// Licensed under the Apache license 2.0
//

// To perform a normal request
import { net } from "electron"
// To emulate a request to the back end
import inject from "light-my-request"

/**
 * @param {object} params
 * @param {inject.DispatchFunc} params.server
 * @param {URL} params.baseURL
 * @param {URL} params.url
 * @param {Request} params.request
 */
async function emulateRequest({ server, baseURL, url, request }) {
    // This function call simply emulates the request.
    const response = await inject(server, {
        method: request.method,
        url: request.url,
        query: url.search,
        remoteAddress: new URL("/", baseURL).toString(),
        body: Buffer.from(await request.arrayBuffer()),
        // We need to convert request headers to the right format and add a few more to prevent errors.
        headers: {
            ...Object.fromEntries([...request.headers]),
            // We don’t want to cache the result, because creating a Response object with status code “304 Not Modified” would throw an error.
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": 0,
            "If-None-Match": null
        }
    }).end()

    // Convert the response to a Node.js’ Response object.
    return new Response(response.body, {
        headers: response.headers,
        status: response.statusCode,
        statusText: response.statusMessage
    })
}

/**
 * @param {URL} baseURL
 * @param {inject.DispatchFunc}
 * @returns {(request: Request) => Promise<Response>}
 */
export function createProxy(baseURL, server) {
    return request => {
        const url = new URL(request.url)

        // If the host doesn’t match our base URL:
        if (url.hostname !== baseURL.hostname) {
            // Simply send the request.
            return net.fetch(request)
        }

        // Otherwise we want to emulate the request.
        return emulateRequest({ server, baseURL, url, request })
    }
}
