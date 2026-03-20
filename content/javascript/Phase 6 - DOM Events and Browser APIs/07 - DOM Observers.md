---
title: DOM Observers
phase: 6
topic: DOM Observers
tags: [javascript, dom, MutationObserver, IntersectionObserver, ResizeObserver, observers]
created: 2025-01-15
---

# DOM Observers

> [!info] **Big Picture**
> Observers are browser APIs that **watch** for specific changes and run callbacks when they occur — without polling. `MutationObserver` watches DOM structure changes, `IntersectionObserver` watches element visibility in the viewport, and `ResizeObserver` watches element size changes. They're more efficient than manual polling and essential for modern UI patterns like lazy loading, infinite scroll, and responsive components.

---

## MutationObserver

Watches for changes to the DOM tree: child additions/removals, attribute changes, text content changes.

### Basic Usage

```js
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    console.log(mutation.type);        // "childList", "attributes", or "characterData"
    console.log(mutation.target);       // the changed node
    console.log(mutation.addedNodes);   // NodeList of added nodes
    console.log(mutation.removedNodes); // NodeList of removed nodes
    console.log(mutation.attributeName); // changed attribute name
    console.log(mutation.oldValue);     // previous value (if configured)
  }
});

observer.observe(targetElement, {
  childList: true,          // watch for child additions/removals
  attributes: true,         // watch for attribute changes
  characterData: true,      // watch for text content changes
  subtree: true,            // watch entire subtree (not just direct children)
  attributeOldValue: true,  // record previous attribute value
  characterDataOldValue: true, // record previous text
  attributeFilter: ["class", "style"] // only watch specific attributes
});

// Stop observing
observer.disconnect();

// Get pending mutations without waiting for callback
const pending = observer.takeRecords();
```

### Real-World: Auto-save on Content Changes

```js
const editor = document.querySelector("[contenteditable]");

const autoSave = new MutationObserver(
  debounce((mutations) => {
    saveContent(editor.innerHTML);
  }, 1000)
);

autoSave.observe(editor, {
  childList: true,
  characterData: true,
  subtree: true
});
```

### Real-World: Detecting Third-Party Script Injection

```js
const bodyObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.tagName === "SCRIPT") {
        console.warn("Script injected:", node.src || node.textContent);
      }
    }
  }
});

bodyObserver.observe(document.body, { childList: true, subtree: true });
```

---

## IntersectionObserver

Detects when an element **enters or leaves the viewport** (or a parent container). No scroll listeners needed.

### Basic Usage

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    console.log(entry.target);           // observed element
    console.log(entry.isIntersecting);   // true = visible
    console.log(entry.intersectionRatio); // 0.0 to 1.0 (how much is visible)
    console.log(entry.boundingClientRect); // element position
  });
}, {
  root: null,          // null = viewport (or specify a scrollable parent)
  rootMargin: "0px",   // margin around root ("100px" = trigger 100px before visible)
  threshold: [0, 0.5, 1] // fire at 0%, 50%, 100% visibility
});

observer.observe(element);
observer.unobserve(element); // stop watching this element
observer.disconnect();        // stop watching everything
```

### Lazy Loading Images

```js
const lazyImages = document.querySelectorAll("img[data-src]");

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;       // load the real image
      img.removeAttribute("data-src");
      imageObserver.unobserve(img);     // stop watching once loaded
    }
  });
}, {
  rootMargin: "200px" // start loading 200px before element appears
});

lazyImages.forEach(img => imageObserver.observe(img));
```

### Infinite Scroll

```js
const sentinel = document.querySelector("#load-more-sentinel");

const scrollObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMoreContent(); // fetch and append next page
  }
}, {
  rootMargin: "500px" // trigger before user reaches the bottom
});

scrollObserver.observe(sentinel);
```

### Scroll-Triggered Animations

```js
const animatedElements = document.querySelectorAll("[data-animate]");

const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate-in");
      animObserver.unobserve(entry.target); // animate only once
    }
  });
}, {
  threshold: 0.2 // trigger when 20% visible
});

animatedElements.forEach(el => animObserver.observe(el));
```

### Sticky Header Detection

```js
const header = document.querySelector("#header");
const sentinel = document.createElement("div");
header.before(sentinel); // invisible element above header

new IntersectionObserver(([entry]) => {
  header.classList.toggle("is-stuck", !entry.isIntersecting);
}).observe(sentinel);
```

---

## ResizeObserver

Fires when an element's **dimensions change** — regardless of what caused it (window resize, content change, CSS animation, etc.).

### Basic Usage

```js
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`${entry.target.id}: ${width}x${height}`);
    
    // entry.contentBoxSize  — content box dimensions (Array of ResizeObserverSize)
    // entry.borderBoxSize   — border box dimensions
    // entry.devicePixelContentBoxSize — device pixel dimensions
  }
});

observer.observe(element);
observer.unobserve(element);
observer.disconnect();
```

### Responsive Component (Container Queries in JS)

```js
const card = document.querySelector(".card");

const resizer = new ResizeObserver(([entry]) => {
  const width = entry.contentRect.width;

  card.classList.toggle("card--compact", width < 300);
  card.classList.toggle("card--normal", width >= 300 && width < 600);
  card.classList.toggle("card--wide", width >= 600);
});

resizer.observe(card);
```

### Auto-Resize Textarea

```js
const textarea = document.querySelector("textarea");

const resizeObserver = new ResizeObserver(() => {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
});

resizeObserver.observe(textarea);
```

---

## Comparison

| Observer | Watches | Common Use Cases | Performance |
|---|---|---|---|
| `MutationObserver` | DOM tree changes | Auto-save, script detection, framework internals | Microtask callback |
| `IntersectionObserver` | Element visibility | Lazy loading, infinite scroll, animations | Async, non-blocking |
| `ResizeObserver` | Element dimensions | Container queries, auto-resize, responsive charts | Async, non-blocking |

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Always disconnect observers** — Forgetting to `disconnect()` or `unobserve()` causes memory leaks and unnecessary computation.
> 2. **`MutationObserver` callbacks are microtasks** — They run after DOM mutations but before rendering, so batch your operations.
> 3. **Infinite loops with MutationObserver** — If your callback modifies the DOM that you're observing, you'll get infinite callbacks. Guard with flags.
> 4. **`IntersectionObserver` fires on registration** — The callback fires immediately when you call `observe()` with the current intersection state.
> 5. **`ResizeObserver` loop limit** — If a resize callback triggers another resize (e.g., by setting height), the browser may throw "ResizeObserver loop limit exceeded." Avoid modifying observed element dimensions in the callback, or use `requestAnimationFrame`.

---

## Related Topics

- [[06 - Events]] — Traditional event-based DOM interaction
- [[02 - DOM Tree and Traversal]] — The DOM tree that observers watch
- [[10 - Browser APIs]] — Other browser observation APIs
- [[06 - Timers and Scheduling]] — Alternative scheduling with rAF, rIC

---

**Navigation:**
← [[06 - Events]] | [[08 - Browser Data Storage]] →
