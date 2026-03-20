---
title: Browser APIs
phase: 6
topic: Browser APIs
tags: [javascript, browser-apis, history, geolocation, notifications, clipboard, canvas, visibility]
created: 2025-01-15
---

# Browser APIs

> [!info] **Big Picture**
> Beyond the DOM and fetch, browsers expose dozens of APIs for interacting with the platform — navigation history, geolocation, notifications, clipboard, screen visibility, and more. These APIs give web applications capabilities that approach native apps. This note covers the most important and commonly used browser APIs.

---

## History API

Manipulate the browser's navigation history for single-page applications (SPAs).

```js
// Push a new entry (changes URL without page reload)
history.pushState({ page: "about" }, "", "/about");

// Replace current entry (no new history entry)
history.replaceState({ page: "home" }, "", "/home");

// Navigate
history.back();     // same as browser back button
history.forward();  // same as browser forward button
history.go(-2);     // go back 2 entries
history.length;     // number of entries in history

// Listen for back/forward navigation
window.addEventListener("popstate", (event) => {
  console.log("Navigated to:", location.pathname);
  console.log("State:", event.state); // the state object from pushState
  renderPage(event.state);
});
```

### Simple SPA Router

```js
function navigate(path, state = {}) {
  history.pushState(state, "", path);
  renderRoute(path);
}

function renderRoute(path) {
  const routes = {
    "/": () => renderHome(),
    "/about": () => renderAbout(),
    "/contact": () => renderContact()
  };
  const render = routes[path] || routes["/"];
  render();
}

// Handle browser back/forward
window.addEventListener("popstate", () => renderRoute(location.pathname));

// Handle link clicks
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-spa]");
  if (link) {
    e.preventDefault();
    navigate(link.getAttribute("href"));
  }
});
```

---

## Geolocation API

Get the user's geographic position (requires permission).

```js
// One-time position
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log("Latitude:", position.coords.latitude);
    console.log("Longitude:", position.coords.longitude);
    console.log("Accuracy:", position.coords.accuracy, "meters");
    console.log("Altitude:", position.coords.altitude); // may be null
    console.log("Speed:", position.coords.speed);       // may be null
  },
  (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED: console.log("Permission denied"); break;
      case error.POSITION_UNAVAILABLE: console.log("Unavailable"); break;
      case error.TIMEOUT: console.log("Timeout"); break;
    }
  },
  {
    enableHighAccuracy: true, // GPS if available (slower, more battery)
    timeout: 10000,           // max time to wait (ms)
    maximumAge: 0             // don't use cached position
  }
);

// Continuous tracking
const watchId = navigator.geolocation.watchPosition(successCallback, errorCallback);
navigator.geolocation.clearWatch(watchId); // stop tracking
```

---

## Notifications API

Show system-level notifications (requires permission).

```js
// Request permission
const permission = await Notification.requestPermission();
// "granted", "denied", or "default"

if (permission === "granted") {
  const notification = new Notification("Hello!", {
    body: "You have 3 new messages",
    icon: "/icons/message.png",
    badge: "/icons/badge.png",
    tag: "messages",   // replaces notification with same tag
    requireInteraction: false
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000);
}

// Check current permission
Notification.permission; // "granted", "denied", "default"
```

---

## Clipboard API

Read from and write to the system clipboard (async, requires permission for read).

```js
// Write to clipboard
await navigator.clipboard.writeText("Hello, copied!");

// Read from clipboard
const text = await navigator.clipboard.readText();

// Copy rich content (HTML, images)
const blob = new Blob(["<b>Bold text</b>"], { type: "text/html" });
await navigator.clipboard.write([
  new ClipboardItem({ "text/html": blob })
]);

// Read rich content
const items = await navigator.clipboard.read();
for (const item of items) {
  for (const type of item.types) {
    const blob = await item.getType(type);
    console.log(type, await blob.text());
  }
}
```

### Copy Button Pattern

```js
async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied!";
    setTimeout(() => button.textContent = "Copy", 2000);
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}
```

---

## Blob and File API

Handle binary data and file operations.

```js
// Create a Blob
const blob = new Blob(["Hello World"], { type: "text/plain" });
const jsonBlob = new Blob([JSON.stringify(data)], { type: "application/json" });

// Create a downloadable URL
const url = URL.createObjectURL(blob);

// Download file
const link = document.createElement("a");
link.href = url;
link.download = "data.json";
link.click();
URL.revokeObjectURL(url); // free memory

// Read file from input
const input = document.querySelector('input[type="file"]');
input.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  console.log(file.name, file.size, file.type);

  // Read as text
  const text = await file.text();

  // Read as ArrayBuffer
  const buffer = await file.arrayBuffer();

  // Read as Data URL (for image preview)
  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result; // "data:image/png;base64,..."
  };
  reader.readAsDataURL(file);
});
```

---

## Canvas API (Basics)

2D drawing on a `<canvas>` element.

```js
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Shapes
ctx.fillStyle = "#3498db";
ctx.fillRect(10, 10, 200, 100);  // filled rectangle

ctx.strokeStyle = "#e74c3c";
ctx.lineWidth = 3;
ctx.strokeRect(50, 50, 100, 60); // outlined rectangle

// Path
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.lineTo(100, 200);
ctx.closePath();
ctx.fill();

// Circle
ctx.beginPath();
ctx.arc(150, 150, 50, 0, Math.PI * 2); // x, y, radius, start, end
ctx.fill();

// Text
ctx.font = "20px Arial";
ctx.fillText("Hello Canvas!", 10, 30);

// Image
const img = new Image();
img.onload = () => ctx.drawImage(img, 0, 0, 200, 150);
img.src = "/photo.jpg";

// Export
canvas.toDataURL("image/png"); // base64 string
canvas.toBlob(blob => { ... }, "image/png");
```

---

## Page Visibility API

Detect when the page is hidden (tab switched, minimized).

```js
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    // Tab is hidden — pause animations, stop polling
    pauseVideo();
    stopPolling();
  } else {
    // Tab is visible — resume
    resumeVideo();
    startPolling();
  }
});

document.hidden;            // true if page is not visible
document.visibilityState;   // "visible" | "hidden" | "prerender"
```

---

## `matchMedia()` — Responsive JavaScript

Listen for CSS media query changes in JavaScript.

```js
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

// Check current value
if (darkQuery.matches) {
  enableDarkMode();
}

// Listen for changes
darkQuery.addEventListener("change", (e) => {
  if (e.matches) enableDarkMode();
  else disableDarkMode();
});

// Screen size
const mobile = window.matchMedia("(max-width: 768px)");
mobile.addEventListener("change", (e) => {
  toggleMobileLayout(e.matches);
});
```

---

## `navigator` and `window`

### `navigator` Properties

```js
navigator.userAgent;        // browser/OS string (unreliable, being deprecated)
navigator.language;         // "en-US"
navigator.languages;        // ["en-US", "en"]
navigator.onLine;           // true if online
navigator.hardwareConcurrency; // CPU cores
navigator.maxTouchPoints;   // touch screen support
navigator.cookieEnabled;    // cookies enabled?
navigator.serviceWorker;    // ServiceWorker API
navigator.storage;          // StorageManager API
```

### `window` Properties

```js
window.innerWidth;   // viewport width
window.innerHeight;  // viewport height
window.outerWidth;   // browser window width
window.outerHeight;  // browser window height
window.devicePixelRatio; // 1 = standard, 2 = retina
window.location;     // URL object
window.screen;       // screen dimensions
window.open(url);    // open new window/tab
window.close();      // close current window
window.print();      // print dialog
```

### Online/Offline Detection

```js
window.addEventListener("online", () => {
  showNotification("Back online!");
  syncPendingData();
});

window.addEventListener("offline", () => {
  showNotification("You're offline — changes will sync when reconnected");
});
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Permissions** — Geolocation, Notifications, and Clipboard read require user permission. Handle denials gracefully.
> 2. **HTTPS required** — Most modern APIs (Geolocation, Notifications, Clipboard, ServiceWorker) only work on HTTPS (and localhost).
> 3. **`pushState` doesn't trigger `popstate`** — Only browser back/forward navigation fires `popstate`. Handle `pushState` navigation manually.
> 4. **`URL.createObjectURL` memory leak** — Always call `URL.revokeObjectURL()` when done to free memory.
> 5. **User activation required** — Notifications, fullscreen, and some clipboard operations require a user gesture (click, keypress).

---

## Related Topics

- [[06 - Events]] — Event listeners for browser interactions
- [[09 - Fetch API and Network Requests]] — Network communication
- [[08 - Browser Data Storage]] — Client-side data persistence
- [[11 - Script Loading]] — How scripts are loaded in the browser

---

**Navigation:**
← [[09 - Fetch API and Network Requests]] | [[11 - Script Loading]] →
