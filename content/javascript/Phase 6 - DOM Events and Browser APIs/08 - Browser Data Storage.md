---
title: Browser Data Storage
phase: 6
topic: Browser Data Storage
tags: [javascript, localStorage, sessionStorage, cookies, IndexedDB, storage]
created: 2025-01-15
---

# Browser Data Storage

> [!info] **Big Picture**
> Browsers provide several ways to store data on the client side. **localStorage** persists indefinitely, **sessionStorage** lasts until the tab closes, **cookies** are sent with every HTTP request, and **IndexedDB** is a full client-side database for large structured data. Choosing the right storage depends on data size, persistence needs, and whether the server needs access.

---

## Quick Comparison

| Feature | `localStorage` | `sessionStorage` | Cookies | IndexedDB |
|---|---|---|---|---|
| Capacity | 5–10 MB | 5–10 MB | ~4 KB per cookie | Hundreds of MB+ |
| Persistence | Until explicitly cleared | Until tab closes | Until expiry / `max-age` | Until explicitly cleared |
| Sent to server? | No | No | **Yes**, every request | No |
| Data format | Strings only | Strings only | Strings only | Structured (objects, blobs) |
| Sync/Async | Synchronous | Synchronous | Synchronous | **Asynchronous** |
| Scope | Same origin | Same origin, same tab | Configurable (domain, path) | Same origin |

---

## `localStorage`

Persists data across browser sessions (survives tab close, browser restart).

```js
// Store
localStorage.setItem("username", "John");
localStorage.setItem("prefs", JSON.stringify({ theme: "dark", lang: "en" }));

// Read
const name = localStorage.getItem("username"); // "John"
const prefs = JSON.parse(localStorage.getItem("prefs")); // { theme: "dark", lang: "en" }

// Check existence
if (localStorage.getItem("token") !== null) {
  // token exists
}

// Remove
localStorage.removeItem("username");

// Clear everything
localStorage.clear();

// Count
localStorage.length; // number of stored items

// Iterate
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, localStorage.getItem(key));
}

// Or with Object.keys (non-standard but works)
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key));
});
```

### Storage Event (Cross-Tab Sync)

```js
// Fires when localStorage is changed in ANOTHER tab of the same origin
window.addEventListener("storage", (e) => {
  console.log("Key changed:", e.key);
  console.log("Old value:", e.oldValue);
  console.log("New value:", e.newValue);
  console.log("URL:", e.url);  // which page made the change
});

// Use case: sync login/logout across tabs
window.addEventListener("storage", (e) => {
  if (e.key === "logout") {
    window.location.href = "/login";
  }
});
```

---

## `sessionStorage`

Same API as `localStorage`, but data is scoped to the **browser tab** and cleared when the tab closes.

```js
sessionStorage.setItem("formDraft", JSON.stringify(formData));
const draft = JSON.parse(sessionStorage.getItem("formDraft"));
```

**Use cases:** form draft data, per-tab state, wizard step tracking.

---

## Safe Storage Wrapper

Always handle errors (storage full, private mode, disabled).

```js
const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn("Storage full or unavailable:", err);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

// Usage
storage.set("user", { name: "John", age: 30 });
const user = storage.get("user"); // { name: "John", age: 30 }
const missing = storage.get("nonexistent", "default"); // "default"
```

---

## Cookies

Small strings sent with **every HTTP request** to the matching domain. Primarily used for authentication and server-side state.

### Reading Cookies

```js
console.log(document.cookie);
// "username=John; sessionId=abc123; theme=dark"

// Parse cookies into an object
function parseCookies() {
  return Object.fromEntries(
    document.cookie.split("; ").map(c => {
      const [key, ...val] = c.split("=");
      return [key, decodeURIComponent(val.join("="))];
    })
  );
}

const cookies = parseCookies();
console.log(cookies.username); // "John"
```

### Setting Cookies

```js
// Basic (expires when browser closes — session cookie)
document.cookie = "username=John";

// With attributes
document.cookie = "username=John; max-age=86400; path=/; secure; SameSite=Lax";
```

### Cookie Attributes

| Attribute | Purpose |
|---|---|
| `expires=Date` | Expiry date (UTC string) |
| `max-age=seconds` | Seconds until expiry (overrides `expires`) |
| `path=/` | Which paths the cookie is accessible from |
| `domain=.example.com` | Which domains can read the cookie |
| `secure` | Only sent over HTTPS |
| `SameSite=Strict|Lax|None` | CSRF protection |
| `HttpOnly` | **Cannot set from JS** — server-only |

### Deleting a Cookie

```js
// Set max-age to 0 or expiry to the past
document.cookie = "username=; max-age=0";
document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
```

> [!warning] **Cookies are sent with EVERY request**
> This includes images, CSS, and API calls to the cookie's domain. Large/numerous cookies slow down every request. Use localStorage for client-only data.

---

## IndexedDB

A full **asynchronous** client-side database with transactions, indexes, and cursor-based queries. Stores structured data including objects, arrays, files, and blobs.

### Basic CRUD Operations

```js
// Open (or create) a database
const request = indexedDB.open("MyApp", 1);

// Runs when database is created or version changes
request.onupgradeneeded = (event) => {
  const db = event.target.result;

  // Create an object store (like a table)
  const store = db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
  store.createIndex("email", "email", { unique: true });
  store.createIndex("age", "age", { unique: false });
};

request.onsuccess = (event) => {
  const db = event.target.result;

  // CREATE
  const tx = db.transaction("users", "readwrite");
  tx.objectStore("users").add({ name: "John", email: "john@example.com", age: 30 });

  // READ
  const readTx = db.transaction("users", "readonly");
  const getReq = readTx.objectStore("users").get(1);
  getReq.onsuccess = () => console.log(getReq.result);

  // UPDATE
  const updateTx = db.transaction("users", "readwrite");
  updateTx.objectStore("users").put({ id: 1, name: "John Doe", email: "john@example.com", age: 31 });

  // DELETE
  const deleteTx = db.transaction("users", "readwrite");
  deleteTx.objectStore("users").delete(1);
};
```

### Promise Wrapper

The raw IndexedDB API is callback-based. Use a wrapper for cleaner code.

```js
function openDB(name, version, upgrade) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = (e) => upgrade(e.target.result);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function dbTransaction(db, storeName, mode, operation) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const result = operation(tx.objectStore(storeName));
    tx.oncomplete = () => resolve(result);
    tx.onerror = (e) => reject(e.target.error);
  });
}

// Usage
const db = await openDB("MyApp", 1, (db) => {
  db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
});

await dbTransaction(db, "notes", "readwrite", (store) => {
  store.add({ title: "Hello", body: "World" });
});
```

> [!tip] **Use a library for IndexedDB**
> The raw API is verbose. Libraries like **idb** (by Jake Archibald) or **Dexie.js** provide a much better developer experience.

---

## Storage Limits

| Storage | Typical Limit |
|---|---|
| `localStorage` | 5–10 MB per origin |
| `sessionStorage` | 5–10 MB per origin |
| Cookies | ~4 KB per cookie, ~50 cookies per domain |
| IndexedDB | Browser-dependent (often 50%+ of disk, GBs) |

```js
// Estimate available storage
if (navigator.storage?.estimate) {
  const { usage, quota } = await navigator.storage.estimate();
  console.log(`Using ${(usage / 1e6).toFixed(1)} MB of ${(quota / 1e6).toFixed(1)} MB`);
}
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **localStorage stores strings only** — Objects become `"[object Object]"`. Always `JSON.stringify`/`JSON.parse`.
> 2. **Storage can throw** — Private/incognito mode or full storage throws errors. Wrap in `try/catch`.
> 3. **Cookies are insecure by default** — Without `Secure` and `HttpOnly`, cookies can be stolen via XSS. Set `SameSite` for CSRF protection.
> 4. **No expiry for localStorage** — Data stays forever. Implement your own expiry logic if needed.
> 5. **Synchronous APIs block** — `localStorage` and `sessionStorage` operations are synchronous and can block the main thread with large data. Use IndexedDB for large datasets.
> 6. **Cross-tab issues** — Only localStorage fires the `storage` event, and only in OTHER tabs.

---

## Related Topics

- [[08 - JSON]] — Serializing data for storage
- [[09 - Fetch API and Network Requests]] — Storing fetched data locally
- [[06 - Events]] — The `storage` event for cross-tab sync
- [[10 - Browser APIs]] — Other browser-provided APIs

---

**Navigation:**
← [[07 - DOM Observers]] | [[09 - Fetch API and Network Requests]] →
