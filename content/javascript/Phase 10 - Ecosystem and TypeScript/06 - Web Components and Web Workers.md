---
title: Web Components and Web Workers
phase: 10
topic: Web Components, Web Workers, Service Workers
tags: [javascript, web-components, shadow-dom, custom-elements, web-workers, service-workers, lit, offline]
created: 2025-01-15
---

# Web Components and Web Workers

> [!info] **Big Picture**
> **Web Components** let you create reusable custom HTML elements with encapsulated styles and behaviour — framework-free. **Web Workers** run JavaScript on separate threads, keeping the UI responsive for CPU-heavy tasks. **Service Workers** sit between the browser and the network, enabling offline support, caching, and push notifications.

---

## Web Components

### The Three Pillars

| Technology | Purpose |
|-----------|---------|
| **Custom Elements** | Define new HTML tags with behaviour |
| **Shadow DOM** | Encapsulate styles and markup |
| **HTML Templates** | Reusable markup fragments |

---

### Custom Elements

```js
class MyCard extends HTMLElement {
  constructor() {
    super();
    // Don't touch DOM here — element isn't in the document yet
  }

  // Called when element is added to the DOM
  connectedCallback() {
    this.innerHTML = `
      <div class="card">
        <h2>${this.getAttribute("title") || "Untitled"}</h2>
        <slot></slot>
      </div>
    `;
  }

  // Called when element is removed from the DOM
  disconnectedCallback() {
    // Clean up: remove event listeners, cancel timers
    console.log("Card removed");
  }

  // Declare which attributes to observe
  static get observedAttributes() {
    return ["title", "theme"];
  }

  // Called when an observed attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "title" && oldValue !== newValue) {
      const h2 = this.querySelector("h2");
      if (h2) h2.textContent = newValue;
    }
  }

  // Called when element is moved to a new document
  adoptedCallback() {
    console.log("Adopted into new document");
  }
}

// Register the custom element
customElements.define("my-card", MyCard);
```

```html
<!-- Usage -->
<my-card title="Hello">
  <p>Card content goes here</p>
</my-card>

<!-- Set attributes dynamically -->
<script>
  const card = document.querySelector("my-card");
  card.setAttribute("title", "Updated Title");
</script>
```

### Lifecycle Callbacks Summary

| Callback | When |
|----------|------|
| `constructor()` | Element created (don't access DOM/attributes) |
| `connectedCallback()` | Added to document — **set up here** |
| `disconnectedCallback()` | Removed from document — **clean up here** |
| `attributeChangedCallback(name, old, new)` | Observed attribute changed |
| `adoptedCallback()` | Moved to new document (rare) |

---

### Shadow DOM

Encapsulation: styles inside don't leak out, outside styles don't leak in.

```js
class StyledButton extends HTMLElement {
  constructor() {
    super();
    // Attach shadow root
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        /* Scoped styles — only apply inside shadow DOM */
        button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }
        button:hover {
          background: #2563eb;
        }

        /* Style the host element itself */
        :host {
          display: inline-block;
          margin: 4px;
        }

        /* Style host based on attribute */
        :host([disabled]) {
          opacity: 0.5;
          pointer-events: none;
        }

        /* Style slotted content from the light DOM */
        ::slotted(span) {
          font-weight: bold;
        }
      </style>
      <button>
        <slot>Default Text</slot>
      </button>
    `;
  }
}

customElements.define("styled-button", StyledButton);
```

```html
<styled-button>Click Me</styled-button>
<styled-button disabled><span>Disabled</span></styled-button>
```

### Shadow DOM Modes

| Mode | `element.shadowRoot` | Use case |
|------|---------------------|----------|
| `"open"` | Accessible from outside | Default — most components |
| `"closed"` | `null` — not accessible | Truly private internals |

### Slots — Composing Content

```js
class MyLayout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        .layout { display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; }
        header { background: #1e293b; color: white; padding: 1rem; }
        footer { background: #334155; color: white; padding: 1rem; }
      </style>
      <div class="layout">
        <header><slot name="header">Default Header</slot></header>
        <main><slot></slot></main>
        <footer><slot name="footer">Default Footer</slot></footer>
      </div>
    `;
  }
}
customElements.define("my-layout", MyLayout);
```

```html
<my-layout>
  <h1 slot="header">My App</h1>
  <p>Main content goes here (default slot)</p>
  <p slot="footer">© 2025</p>
</my-layout>
```

---

### HTML Templates

```html
<template id="card-template">
  <style>
    .card { border: 1px solid #ddd; padding: 16px; border-radius: 8px; }
  </style>
  <div class="card">
    <h3></h3>
    <p></p>
  </div>
</template>

<script>
  function createCard(title, body) {
    const template = document.getElementById("card-template");
    const clone = template.content.cloneNode(true);
    clone.querySelector("h3").textContent = title;
    clone.querySelector("p").textContent = body;
    return clone;
  }

  document.body.appendChild(createCard("Hello", "World"));
</script>
```

---

### Lit (Recommended Library)

Lit simplifies Web Components with reactive properties, declarative templates, and tiny size (~5KB).

```bash
npm install lit
```

```js
import { LitElement, html, css } from "lit";

class MyCounter extends LitElement {
  static styles = css`
    button { font-size: 1.5rem; padding: 8px 16px; }
    span { margin: 0 12px; font-size: 2rem; }
  `;

  static properties = {
    count: { type: Number }
  };

  constructor() {
    super();
    this.count = 0;
  }

  render() {
    return html`
      <button @click=${() => this.count--}>-</button>
      <span>${this.count}</span>
      <button @click=${() => this.count++}>+</button>
    `;
  }
}

customElements.define("my-counter", MyCounter);
```

```html
<my-counter></my-counter>
```

---

## Web Workers

Run CPU-intensive code on a **separate thread** — no UI blocking.

### Basic Web Worker

```js
// main.js
const worker = new Worker("worker.js");

// Send data to worker
worker.postMessage({ numbers: [1, 2, 3, 4, 5] });

// Receive results
worker.onmessage = (event) => {
  console.log("Sum:", event.data.result); // 15
};

// Handle errors
worker.onerror = (event) => {
  console.error("Worker error:", event.message);
};

// Terminate when done
worker.terminate();
```

```js
// worker.js
self.onmessage = (event) => {
  const { numbers } = event.data;
  const result = numbers.reduce((sum, n) => sum + n, 0);

  // Send result back
  self.postMessage({ result });
};
```

### Inline Worker (No Separate File)

```js
const workerCode = `
  self.onmessage = (e) => {
    const result = e.data * 2;
    self.postMessage(result);
  };
`;

const blob = new Blob([workerCode], { type: "application/javascript" });
const worker = new Worker(URL.createObjectURL(blob));

worker.postMessage(21);
worker.onmessage = (e) => console.log(e.data); // 42
```

### Worker with Vite

```js
// Vite supports ?worker import
import MyWorker from "./worker.js?worker";

const worker = new MyWorker();
worker.postMessage("hello");
```

### What Workers CAN and CAN'T Do

| ✅ Can Do | ❌ Cannot Do |
|-----------|-------------|
| Heavy computation | Access DOM |
| `fetch()` requests | Access `document` / `window` |
| `setTimeout` / `setInterval` | Manipulate UI |
| `IndexedDB` | Use `alert()` / `confirm()` |
| `WebSocket` | Access parent's variables directly |
| `importScripts()` | |

---

## Transferable Objects

Move data to workers without copying (zero-copy).

```js
// main.js
const buffer = new ArrayBuffer(1024 * 1024); // 1MB
console.log(buffer.byteLength); // 1048576

// Transfer ownership — buffer becomes unusable in main thread
worker.postMessage({ data: buffer }, [buffer]);
console.log(buffer.byteLength); // 0 — transferred!
```

```js
// worker.js
self.onmessage = (e) => {
  const buffer = e.data.data;
  // Process the buffer...
  // Transfer back
  self.postMessage({ data: buffer }, [buffer]);
};
```

---

## SharedArrayBuffer and Atomics

Share memory between threads (requires COOP/COEP headers).

```js
// main.js
const shared = new SharedArrayBuffer(1024);
const view = new Int32Array(shared);

worker.postMessage({ buffer: shared }); // shared, not transferred

// Atomic operations — thread-safe
Atomics.store(view, 0, 42);
Atomics.add(view, 0, 8);
const val = Atomics.load(view, 0); // 50

// Wait/notify for synchronisation
Atomics.wait(view, 0, 50);  // blocks until value changes (worker thread only)
Atomics.notify(view, 0, 1); // wake one waiting thread
```

> [!warning] **Required Headers for SharedArrayBuffer**
> ```http
> Cross-Origin-Opener-Policy: same-origin
> Cross-Origin-Embedder-Policy: require-corp
> ```

---

## Service Workers

Programmable network proxy — enables offline support, caching, and push notifications.

### Registration

```js
// main.js
if ("serviceWorker" in navigator) {
  const reg = await navigator.serviceWorker.register("/sw.js", {
    scope: "/"
  });
  console.log("SW registered:", reg.scope);
}
```

### Lifecycle

```
Install → Activate → Fetch (intercept requests)
```

```js
// sw.js
const CACHE_NAME = "app-v1";
const ASSETS = ["/", "/index.html", "/style.css", "/app.js"];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // activate immediately
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // take control immediately
});

// Fetch — serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Cache new requests dynamically
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
```

### Caching Strategies

| Strategy | Approach | Best for |
|----------|----------|----------|
| **Cache First** | Cache → Network (fallback) | Static assets, fonts |
| **Network First** | Network → Cache (fallback) | API data, frequently updated content |
| **Stale While Revalidate** | Cache (instant) + Network (update cache) | Balance speed + freshness |
| **Network Only** | Network only | Real-time data, payments |
| **Cache Only** | Cache only | Offline-specific assets |

### Stale While Revalidate

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        const fetched = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cached || fetched;
      })
    )
  );
});
```

---

## Streams API

Process data in chunks — useful for large files, real-time data.

```js
// Read a large file as a stream
const response = await fetch("/large-file.json");
const reader = response.body.getReader();
const decoder = new TextDecoder();

let result = "";
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  result += decoder.decode(value, { stream: true });
  console.log("Chunk received:", value.length, "bytes");
}

console.log("Total:", result.length);
```

### Transform Stream

```js
// Convert stream chunks to uppercase
const upperCaseTransform = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase());
  }
});

const response = await fetch("/data.txt");
const transformed = response.body
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(upperCaseTransform);

const reader = transformed.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(value); // uppercased text
}
```

---

## When to Use What

| Need | Solution |
|------|----------|
| Reusable UI element (framework-agnostic) | **Custom Element + Shadow DOM** |
| Heavy computation without blocking UI | **Web Worker** |
| Offline support / caching | **Service Worker** |
| Shared memory between threads | **SharedArrayBuffer + Atomics** |
| Processing large data streams | **Streams API** |
| Simple template reuse | **HTML `<template>`** |

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Custom element names MUST have a hyphen** — `my-card` ✅, `mycard` ❌.
> 2. **Don't access DOM in constructor** — Wait for `connectedCallback()`.
> 3. **Service Workers require HTTPS** — Exception: `localhost` for development.
> 4. **Workers can't access the DOM** — Send data via `postMessage`, update DOM in main thread.
> 5. **Shadow DOM blocks `querySelector` from outside** — Use `element.shadowRoot.querySelector()` (open mode only).
> 6. **Service Worker updates** — Changing cache version name is critical; old SWs stay active until all tabs close.

---

## Related Topics

- [[02 - DOM Tree and Traversal]] — DOM fundamentals that components build on
- [[06 - Events]] — Custom events for component communication
- [[02 - The Event Loop]] — How workers interact with the main thread
- [[09 - Fetch API and Network Requests]] — Network requests in Service Workers

---

**Navigation:**
← [[05 - Security]] | 🎓 **End of Roadmap — You made it!**
