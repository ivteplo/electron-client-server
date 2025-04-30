# Back-End Server Emulation for Electron Applications

When creating an Electron app, you might find yourself having to deal with interprocess communication (IPC). However, you can use the familiar client-server communication approach from web development. **Without starting a local server**. For better understanding, please refer to [the article](https://ivanteplov.vercel.app/en/blog/posts/2025-04-25-electron-client-server-architecture).

## Installation

```bash
npm install electron-client-server electron
```

## Usage

First, import the library in your main module (where the Electron app is initialized):

```javascript
import { applyProxy } from "electron-client-server"
```

Then declare a constant containing the URL at which your frontend can reach the backend.

```javascript
const baseURL = new URL("http://app.local/")
```

After your Electron app finished initializing, apply the proxy:

```javascript
app.whenReady().then(() => {
    applyProxy(baseURL, server)
})
```

There is also an example project in [the `example` folder](./example/) of the repository.
