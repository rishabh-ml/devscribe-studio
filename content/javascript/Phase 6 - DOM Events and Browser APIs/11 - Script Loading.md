---
title: Script Loading
phase: 6
topic: Script Loading
tags: [javascript, script, defer, async, preload, prefetch, dynamic-import, loading]
created: 2025-01-15
---

# Script Loading

> [!info] **Big Picture**
> How and when JavaScript loads affects page performance. A regular `<script>` tag **blocks** HTML parsing — the browser stops building the DOM until the script downloads and executes. `defer` and `async` attributes change this behavior. Understanding these strategies is essential for fast page loads and good Core Web Vitals scores.

---

## Loading Strategies

### Regular `<script>` — Blocks Everything

```html
<script src="app.js"></script>
```

```
HTML:    ──── PARSE ──── BLOCKED ──── PARSE ────
Script:                  ↓download↓ ↓execute↓
```

The browser stops parsing HTML, downloads the script, executes it, then continues parsing. **Worst for performance.**

### `<script defer>` — Parse, Then Execute in Order

```html
<script defer src="app.js"></script>
<script defer src="utils.js"></script>
```

```
HTML:    ──── PARSE ──── PARSE ──── PARSE ──── PARSE ────
Script:       ↓download↓                      ↓execute↓
Utils:             ↓download↓                  ↓execute↓ (after app.js)
```

- Downloads **in parallel** with HTML parsing
- Executes **after** HTML is fully parsed
- Maintains **script order** (app.js before utils.js)
- Fires **before** `DOMContentLoaded`

> [!tip] **`defer` is the best default for most scripts**
> It combines parallel download with guaranteed execution order and doesn't block the page.

### `<script async>` — Execute Whenever Ready

```html
<script async src="analytics.js"></script>
<script async src="ads.js"></script>
```

```
HTML:    ──── PARSE ──── BLOCKED ── PARSE ──── PARSE ────
Script:       ↓download↓ ↓execute↓            
Ads:               ↓download......↓ ↓execute↓  ← (no order guarantee)
```

- Downloads **in parallel** with HTML parsing
- Executes **immediately** when download finishes (blocks parsing briefly)
- **No order guarantee** — first to download runs first
- Does NOT wait for `DOMContentLoaded`

### `<script type="module">` — Deferred by Default

```html
<script type="module" src="app.mjs"></script>
```

- Behaves like `defer` by default
- Can also use `async` attribute
- Always runs in strict mode
- Has its own scope (top-level `var` won't pollute global)

---

## Comparison Table

| Attribute | Downloads | Executes | Order | Blocks HTML? |
|---|---|---|---|---|
| (none) | Sequentially | Immediately | Maintained | **Yes** |
| `defer` | In parallel | After parsing | Maintained | No |
| `async` | In parallel | When ready | **No guarantee** | Briefly |
| `type="module"` | In parallel | After parsing | Maintained | No |

---

## Best Practices

```html
<head>
  <!-- Critical CSS first -->
  <link rel="stylesheet" href="styles.css">

  <!-- Main app scripts — defer preserves order -->
  <script defer src="vendor.js"></script>
  <script defer src="app.js"></script>

  <!-- Independent scripts (analytics, ads) — async is fine -->
  <script async src="analytics.js"></script>
</head>

<body>
  <!-- ... content ... -->

  <!-- Alternative: scripts at end of body (legacy approach) -->
  <!-- <script src="app.js"></script> -->
</body>
```

| Script Type | Use |
|---|---|
| Main application code | `defer` |
| Analytics, ads, widgets | `async` |
| Inline scripts that need the DOM | After `DOMContentLoaded` or at end of `<body>` |
| ES modules | `type="module"` (auto-deferred) |

---

## Dynamic Script Loading

Load scripts programmatically at runtime.

```js
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Usage
await loadScript("https://cdn.example.com/library.js");
// Library is now available

// Conditional loading
if (needsChart) {
  await loadScript("/js/chart-library.js");
  renderChart();
}
```

---

## Resource Hints

Tell the browser about resources it will need — start fetching early.

### `preload` — Fetch Now, Use Soon

```html
<!-- High priority — needed for current page -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/js/critical.js" as="script">
<link rel="preload" href="/css/above-fold.css" as="style">
<link rel="preload" href="/hero.jpg" as="image">
```

### `prefetch` — Fetch Later, Might Need Next

```html
<!-- Low priority — might need on next navigation -->
<link rel="prefetch" href="/js/dashboard.js">
<link rel="prefetch" href="/next-page.html">
```

### `preconnect` — Establish Early Connection

```html
<!-- DNS lookup + TCP + TLS handshake ahead of time -->
<link rel="preconnect" href="https://api.example.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
```

### `dns-prefetch` — DNS Only

```html
<link rel="dns-prefetch" href="https://analytics.example.com">
```

### `modulepreload` — For ES Modules

```html
<link rel="modulepreload" href="/js/module.mjs">
```

---

## Inline Scripts and `DOMContentLoaded`

```html
<!-- Inline script — executes immediately (DOM may not be ready) -->
<script>
  // ❌ May fail if element is below this script
  document.getElementById("app").textContent = "Hello";
</script>

<!-- ✅ Wait for DOM to be ready -->
<script>
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("app").textContent = "Hello";
  });
</script>

<!-- ✅ Or place at end of body -->
<body>
  <div id="app"></div>
  <script>
    document.getElementById("app").textContent = "Hello"; // works
  </script>
</body>
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`defer` only works with `src`** — Inline scripts ignore `defer`. Use `DOMContentLoaded` instead.
> 2. **`async` breaks execution order** — Don't use for scripts that depend on each other.
> 3. **Duplicate script loading** — Dynamic loading doesn't check for duplicates. Track loaded scripts manually.
> 4. **`preload` without use** — If you preload a resource but don't use it within ~3 seconds, the browser warns in the console. Only preload what you'll actually use.
> 5. **CORS for modules** — `<script type="module">` uses CORS by default. The server must send appropriate headers for cross-origin modules.

---

## Related Topics

- [[10 - Browser APIs]] — Other browser platform features
- [[06 - Events]] — `DOMContentLoaded` and `load` events
- [[09 - Fetch API and Network Requests]] — Dynamic resource loading
- [[02 - DOM Tree and Traversal]] — Understanding when the DOM is ready

---

**Navigation:**
← [[10 - Browser APIs]] | Phase 6 Complete → [[01 - Phase 7 - Overview]]
