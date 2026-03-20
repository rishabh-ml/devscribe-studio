---
title: Fetch API and Network Requests
phase: 6
topic: Fetch API and Network Requests
tags: [javascript, fetch, http, ajax, cors, FormData, network, REST]
created: 2025-01-15
---

# Fetch API and Network Requests

> [!info] **Big Picture**
> The `fetch()` API is the modern way to make HTTP requests from JavaScript. It returns a Promise that resolves to a `Response` object — you then extract the data in the format you need (JSON, text, blob). Understanding HTTP methods, status codes, headers, CORS, and request cancellation is essential for any web developer communicating with APIs.

---

## Basic `fetch()`

```js
// GET request (default)
const response = await fetch("https://api.example.com/users");
const users = await response.json();
console.log(users);
```

### The Two-Step Process

```js
// Step 1: fetch() resolves when HEADERS arrive
const response = await fetch("/api/data");

// Step 2: Read the BODY (also async)
const data = await response.json();   // parse as JSON
// OR
const text = await response.text();   // raw text
const blob = await response.blob();   // binary data
const buffer = await response.arrayBuffer();
const formData = await response.formData();
```

> [!warning] **The body can only be read ONCE**
> Calling `response.json()` or `response.text()` consumes the body stream. Calling it again throws. Clone first if you need to read twice: `response.clone()`.

---

## Response Properties

```js
const res = await fetch("/api/data");

res.ok;          // true if status is 200-299
res.status;      // 200, 404, 500, etc.
res.statusText;  // "OK", "Not Found", etc.
res.headers;     // Headers object
res.url;         // final URL (after redirects)
res.redirected;  // true if response was redirected
res.type;        // "basic", "cors", "opaque"
```

> [!danger] **`fetch()` does NOT reject on HTTP errors**
> A 404 or 500 response is still a "successful" fetch. You MUST check `response.ok` or `response.status`.

```js
const response = await fetch("/api/data");

if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

const data = await response.json();
```

---

## HTTP Methods

### GET (Read)

```js
const res = await fetch("/api/users?role=admin");
```

### POST (Create)

```js
const res = await fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "John",
    email: "john@example.com"
  })
});

const newUser = await res.json();
```

### PUT / PATCH (Update)

```js
// PUT — replace entire resource
await fetch("/api/users/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "John", email: "john@new.com" })
});

// PATCH — partial update
await fetch("/api/users/1", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "john@new.com" })
});
```

### DELETE

```js
await fetch("/api/users/1", { method: "DELETE" });
```

---

## Request Options

```js
const response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer token123",
    "X-Custom-Header": "value"
  },
  body: JSON.stringify(data),
  mode: "cors",              // "cors" | "no-cors" | "same-origin"
  credentials: "same-origin", // "same-origin" | "include" | "omit"
  cache: "default",          // "default" | "no-store" | "reload" | "no-cache" | "force-cache"
  redirect: "follow",        // "follow" | "error" | "manual"
  signal: controller.signal, // AbortController signal
});
```

### Credentials (Cookies)

```js
// Same-origin only (default)
fetch("/api/data", { credentials: "same-origin" });

// Send cookies to any domain (CORS must allow)
fetch("https://other.com/api", { credentials: "include" });

// Never send cookies
fetch("/api/data", { credentials: "omit" });
```

---

## Headers Object

```js
const headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("Authorization", "Bearer token");
headers.set("X-Custom", "value");   // set (replaces if exists)
headers.get("Content-Type");         // "application/json"
headers.has("Authorization");        // true
headers.delete("X-Custom");

// Iterate
for (const [name, value] of headers) {
  console.log(`${name}: ${value}`);
}

// Read response headers
const res = await fetch("/api/data");
res.headers.get("Content-Type"); // "application/json; charset=utf-8"
```

---

## Status Codes

| Range | Meaning | Common Codes |
|---|---|---|
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirect | 301 Moved, 304 Not Modified |
| 4xx | Client error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| 5xx | Server error | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable |

---

## `FormData`

For multipart form submissions (file uploads).

```js
// From a form element
const form = document.querySelector("form");
const formData = new FormData(form);

// Build manually
const fd = new FormData();
fd.append("name", "John");
fd.append("avatar", fileInput.files[0]); // File object

// Send (don't set Content-Type — browser adds it with boundary)
const res = await fetch("/api/upload", {
  method: "POST",
  body: fd // no JSON.stringify, no Content-Type header
});
```

---

## `URL` and `URLSearchParams`

Build URLs safely — handle encoding automatically.

```js
// Build URL with query params
const url = new URL("https://api.example.com/search");
url.searchParams.set("q", "hello world");
url.searchParams.set("page", "1");
url.searchParams.append("tag", "js");
url.searchParams.append("tag", "web");

console.log(url.toString());
// "https://api.example.com/search?q=hello+world&page=1&tag=js&tag=web"

// Parse existing URL
const parsed = new URL("https://example.com:8080/path?key=value#hash");
parsed.hostname;    // "example.com"
parsed.port;        // "8080"
parsed.pathname;    // "/path"
parsed.searchParams.get("key"); // "value"
parsed.hash;        // "#hash"

// URLSearchParams standalone
const params = new URLSearchParams("?q=hello&page=1");
params.get("q");   // "hello"
params.toString(); // "q=hello&page=1"
```

---

## CORS (Cross-Origin Resource Sharing)

When your page (e.g., `localhost:3000`) requests resources from a different origin (e.g., `api.example.com`), the browser enforces CORS restrictions.

```
1. Browser sends request with Origin header
2. Server responds with Access-Control-Allow-Origin header
3. If origins match → browser allows the response
4. If not → browser blocks the response (CORS error)
```

### Preflight Requests

For certain requests (non-GET, custom headers), the browser sends an OPTIONS request first.

```
Browser → OPTIONS /api/data
         Origin: http://localhost:3000
         Access-Control-Request-Method: POST
         Access-Control-Request-Headers: Content-Type

Server → 200 OK
         Access-Control-Allow-Origin: http://localhost:3000
         Access-Control-Allow-Methods: GET, POST, PUT, DELETE
         Access-Control-Allow-Headers: Content-Type, Authorization
         Access-Control-Max-Age: 86400

Browser → POST /api/data (actual request)
```

> [!note] **CORS is a server-side configuration**
> CORS errors cannot be fixed in client-side JavaScript. The SERVER must send the correct `Access-Control-Allow-*` headers. During development, use a proxy (`vite.config.js` proxy, or a CORS proxy service).

---

## Request Cancellation

```js
const controller = new AbortController();

// Start request
const promise = fetch("/api/data", { signal: controller.signal });

// Cancel it
controller.abort();

try {
  const response = await promise;
} catch (err) {
  if (err.name === "AbortError") {
    console.log("Request cancelled");
  }
}

// Timeout (ES2022)
const res = await fetch("/api/data", {
  signal: AbortSignal.timeout(5000) // 5 second timeout
});
```

---

## Real-World Fetch Wrapper

```js
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    // 204 No Content
    if (response.status === 204) return null;

    return response.json();
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  put(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

// Usage
const api = new ApiClient("https://api.example.com");
const users = await api.get("/users");
const newUser = await api.post("/users", { name: "John" });
```

---

## Legacy: `XMLHttpRequest`

The pre-fetch API. Understand it exists but use `fetch` for new code.

```js
// You'll see this in older codebases
const xhr = new XMLHttpRequest();
xhr.open("GET", "/api/data");
xhr.onload = () => {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
  }
};
xhr.onerror = () => console.error("Request failed");
xhr.send();
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`fetch` doesn't reject on 404/500** — Check `response.ok` manually.
> 2. **Body is consumed once** — Use `response.clone()` if you need to read it twice.
> 3. **Don't set Content-Type for FormData** — The browser sets it automatically with the correct boundary.
> 4. **CORS is server-side** — Client-side JS cannot bypass CORS. Configure the server or use a proxy.
> 5. **JSON body must be stringified** — `body: { name: "John" }` doesn't work. Use `JSON.stringify()`.
> 6. **Credentials not sent by default** — For cross-origin requests, set `credentials: "include"` to send cookies.

---

## Related Topics

- [[03 - Promises]] — `fetch()` returns a Promise
- [[04 - Async Await]] — Modern syntax for consuming fetch
- [[06 - Timers and Scheduling]] — AbortController and timeouts
- [[05 - Error Handling]] — Handling network errors
- [[08 - JSON]] — Parsing and stringifying request/response data

---

**Navigation:**
← [[08 - Browser Data Storage]] | [[10 - Browser APIs]] →
