---
title: Memory Management and Performance
phase: 9
topic: Memory Management and Performance
tags: [javascript, memory, garbage-collection, performance, memory-leaks, devtools, web-vitals, optimization]
created: 2025-01-15
---

# Memory Management and Performance

> [!info] **Big Picture**
> JavaScript uses automatic **garbage collection** — you don't manually allocate/free memory. But you still need to understand how it works to avoid **memory leaks** (retained references that keep objects alive), profile with **DevTools**, and optimize performance using techniques like debouncing, throttling, lazy loading, and tree shaking.

---

## Garbage Collection Basics

### Mark-and-Sweep Algorithm

The primary GC algorithm in all modern JavaScript engines:

1. **Mark** — Starting from "roots" (global object, current call stack, closures), follow all references and mark reachable objects.
2. **Sweep** — Free memory of all unmarked (unreachable) objects.

```
Roots (Global, Stack)
  │
  ├──► Object A ──► Object C
  │
  └──► Object B
  
  Object D ← unreachable → COLLECTED
  Object E ← unreachable → COLLECTED
```

### V8 Generational GC

The V8 engine (Chrome, Node.js) splits the heap into generations:

| Generation | Contains | GC Type | Frequency |
|-----------|----------|---------|-----------|
| **Young (Nursery)** | Newly created objects | Minor GC (Scavenger) | Frequent, fast (~1-10ms) |
| **Old** | Objects that survived multiple Minor GCs | Major GC (Mark-Compact) | Infrequent, slower (~100ms) |

**Hypothesis**: Most objects die young. A fast Minor GC on the young generation catches most garbage without scanning the entire heap.

```
New Object → Young Generation ──(survives)──► Old Generation
                    │
                 (dies) → Collected quickly
```

---

## Memory Leaks

A memory leak occurs when objects that are no longer needed remain referenced, preventing garbage collection.

### 1. Forgotten Timers and Intervals

```js
// ❌ LEAK: interval keeps referencing largeData
function startPolling() {
  const largeData = new Array(1000000).fill("x");
  setInterval(() => {
    processData(largeData); // largeData can never be GC'd
  }, 1000);
}

// ✅ FIX: clear the interval
function startPolling() {
  const largeData = new Array(1000000).fill("x");
  const id = setInterval(() => {
    processData(largeData);
  }, 1000);

  return () => clearInterval(id); // return cleanup function
}

const stop = startPolling();
stop(); // now largeData can be collected
```

### 2. Event Listeners Never Removed

```js
// ❌ LEAK: listener keeps component alive
class Component {
  constructor() {
    this.data = new Array(100000).fill("x");
    window.addEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    // uses this.data
  };
}
// Even after component is "destroyed", window holds reference

// ✅ FIX: remove listener on cleanup
class Component {
  constructor() {
    this.data = new Array(100000).fill("x");
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  handleResize() { /* ... */ }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
  }
}

// ✅ Even better: use AbortController
class Component {
  #controller = new AbortController();

  constructor() {
    window.addEventListener("resize", this.handleResize, {
      signal: this.#controller.signal
    });
    document.addEventListener("scroll", this.handleScroll, {
      signal: this.#controller.signal
    });
  }

  destroy() {
    this.#controller.abort(); // removes ALL listeners at once
  }
}
```

### 3. Detached DOM Nodes

```js
// ❌ LEAK: JS still references removed DOM node
const elements = [];
function addItem() {
  const div = document.createElement("div");
  document.body.appendChild(div);
  elements.push(div); // keeps reference even if removed from DOM
}

function removeItem() {
  const div = elements[0];
  document.body.removeChild(div);
  // div is removed from DOM but still in elements array!
}

// ✅ FIX: clear JS reference too
function removeItem() {
  const div = elements.shift(); // remove from array
  document.body.removeChild(div);
}
```

### 4. Closures Holding Onto Large Scopes

```js
// ❌ Potential leak: closure captures large variable
function process() {
  const hugeData = new Array(10000000).fill("x");
  const id = hugeData.length;

  return function getId() {
    return id; // only needs 'id', but 'hugeData' may be retained
  };
}

// ✅ FIX: don't capture more than needed
function process() {
  const hugeData = new Array(10000000).fill("x");
  const id = hugeData.length;
  // hugeData goes out of scope here (modern engines optimize this)

  return function getId() {
    return id;
  };
}
```

### 5. Growing Collections Never Cleaned

```js
// ❌ LEAK: map grows forever
const cache = new Map();

function getData(key) {
  if (!cache.has(key)) {
    cache.set(key, expensiveComputation(key));
  }
  return cache.get(key);
}

// ✅ FIX: use LRU cache or WeakMap
// Option 1: WeakMap (auto-cleans when keys are GC'd)
const cache = new WeakMap();

// Option 2: LRU with max size
class LRUCache {
  #max;
  #cache = new Map();

  constructor(max = 100) { this.#max = max; }

  get(key) {
    if (!this.#cache.has(key)) return undefined;
    const value = this.#cache.get(key);
    this.#cache.delete(key);
    this.#cache.set(key, value); // move to end (most recent)
    return value;
  }

  set(key, value) {
    this.#cache.delete(key);
    this.#cache.set(key, value);
    if (this.#cache.size > this.#max) {
      const oldest = this.#cache.keys().next().value;
      this.#cache.delete(oldest);
    }
  }
}
```

### 6. Global Variables

```js
// ❌ LEAK: accidental global
function process() {
  data = new Array(1000000); // no let/const — creates global!
}

// ✅ FIX: always use let/const, use strict mode
"use strict";
function process() {
  const data = new Array(1000000); // stays local
}
```

---

## Chrome DevTools Memory Tools

### Heap Snapshot

**Memory tab → Take Heap Snapshot**

- View all objects in memory with their size and retainers
- Compare two snapshots to find leaked objects
- Filter by constructor name (e.g., "Detached" for detached DOM nodes)

### Allocation Timeline

**Memory tab → Allocation Instrumentation on Timeline**

- Records allocations over time
- Blue bars = still alive, gray bars = collected
- Identify functions that allocate excessively

### Performance Tab

**Performance → Record**

- Flame chart shows function execution time
- Identify long tasks blocking the main thread
- See GC pauses (labeled "Minor GC" / "Major GC")

### Quick Leak Detection Workflow

1. Open DevTools → Performance tab
2. Record while performing the suspected leaking action repeatedly
3. Check if JS Heap size trends upward (memory never comes back down)
4. Take heap snapshots before and after — compare to find retained objects
5. Check "Retainers" panel to see what's keeping the object alive

---

## Performance Optimization

### Debouncing

Delay execution until input stops for a set period.

```js
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Use case: search-as-you-type
const searchInput = document.getElementById("search");
searchInput.addEventListener("input", debounce(e => {
  fetchResults(e.target.value);
}, 300));
```

### Throttling

Execute at most once per interval.

```js
function throttle(fn, interval) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// Use case: scroll handler
window.addEventListener("scroll", throttle(() => {
  updateScrollProgress();
}, 100));
```

### Lazy Loading

```js
// Images
<img src="placeholder.jpg" data-src="large-image.jpg" loading="lazy" />

// Code splitting with dynamic import
const module = await import("./heavy-module.js");

// Component-level (React pattern)
const LazyComponent = React.lazy(() => import("./HeavyComponent"));
```

### Tree Shaking

Eliminates unused exports from bundles. Requires:
- ES modules (`import`/`export`, NOT `require`)
- A bundler (Vite, Webpack, Rollup)
- Side-effect-free modules

```js
// math.js
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; } // unused

// app.js
import { add } from "./math.js";
// multiply is tree-shaken out of the bundle
```

```json
// package.json — mark package as side-effect-free
{
  "sideEffects": false
}
```

---

## Performance Measurement

### `performance.now()`

```js
const start = performance.now();
expensiveOperation();
const end = performance.now();
console.log(`Took ${(end - start).toFixed(2)}ms`);
```

### `performance.mark()` / `performance.measure()`

```js
performance.mark("start-process");

// ... do work ...

performance.mark("end-process");
performance.measure("processing", "start-process", "end-process");

const [entry] = performance.getEntriesByName("processing");
console.log(`Processing took ${entry.duration.toFixed(2)}ms`);
```

### `PerformanceObserver`

```js
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
  }
});

observer.observe({ entryTypes: ["measure", "resource", "longtask"] });
```

---

## Core Web Vitals (2025)

Google's metrics for user experience, directly affecting SEO ranking.

| Metric | What | Good | Measures |
|--------|------|------|----------|
| **LCP** (Largest Contentful Paint) | Loading | < 2.5s | When the largest visible element renders |
| **INP** (Interaction to Next Paint) | Responsiveness | < 200ms | Delay from user interaction to visual update |
| **CLS** (Cumulative Layout Shift) | Visual stability | < 0.1 | How much layout shifts unexpectedly |

### LCP Optimization

```js
// Preload critical resources
<link rel="preload" href="hero.jpg" as="image" />

// Use fetchpriority for important images
<img src="hero.jpg" fetchpriority="high" />

// Inline critical CSS
<style>/* critical above-the-fold styles */</style>
```

### INP Optimization

```js
// Break up long tasks
function processLargeList(items) {
  const chunks = chunk(items, 100);
  let i = 0;

  function processChunk() {
    if (i < chunks.length) {
      processItems(chunks[i++]);
      // Yield to main thread between chunks
      setTimeout(processChunk, 0);
    }
  }

  processChunk();
}

// Use requestIdleCallback for non-urgent work
requestIdleCallback(deadline => {
  while (deadline.timeRemaining() > 0 && tasks.length) {
    performTask(tasks.shift());
  }
});

// Use Web Workers for CPU-intensive work
const worker = new Worker("heavy-computation.js");
worker.postMessage(data);
worker.onmessage = e => updateUI(e.data);
```

### CLS Optimization

```js
// Set explicit dimensions on images/videos
<img src="photo.jpg" width="800" height="600" />

// Reserve space for dynamic content
.ad-slot { min-height: 250px; }

// Use transform animations (not width/height/top/left)
.animated { transform: translateX(100px); } // ✅ no layout shift
.animated { left: 100px; }                 // ❌ causes reflow
```

---

## `requestAnimationFrame` for Smooth Animations

```js
function animate() {
  element.style.transform = `translateX(${position}px)`;
  position += speed;

  if (position < targetPosition) {
    requestAnimationFrame(animate); // synced with 60fps refresh
  }
}

requestAnimationFrame(animate);
```

---

## Quick Reference: Optimization Checklist

- [ ] Remove unused event listeners (use `AbortController`)
- [ ] Clear timers/intervals on component destruction
- [ ] Use `WeakMap`/`WeakSet` for object metadata caches
- [ ] Debounce search/input handlers
- [ ] Throttle scroll/resize handlers
- [ ] Lazy load images and code-split heavy modules
- [ ] Use `requestAnimationFrame` for visual animations
- [ ] Offload CPU-intensive work to `Web Workers`
- [ ] Ensure tree shaking works (use ESM, mark `sideEffects: false`)
- [ ] Measure with DevTools before optimizing
- [ ] Set explicit sizes on images/videos (prevent CLS)
- [ ] Break long tasks into chunks (improve INP)

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Don't optimize prematurely** — Measure first with DevTools, then optimize the actual bottleneck.
> 2. **WeakMap doesn't help with string keys** — String keys are primitives, not garbage-collectable objects.
> 3. **`console.log` retains references** — Objects logged to the console are kept alive by DevTools. Clear the console or use production builds when profiling.
> 4. **Closures in loops** — Each closure in a loop may capture the same variable. Use `let` or create a new scope.
> 5. **`transform` vs layout properties** — CSS `transform` and `opacity` animate on the compositor thread (cheap). `width`, `height`, `top`, `left` trigger layout (expensive).

---

## Related Topics

- [[02 - The Event Loop]] — Understanding task scheduling
- [[06 - Timers and Scheduling]] — Debounce, throttle, `requestAnimationFrame`
- [[05 - WeakRef and FinalizationRegistry]] — Advanced GC-aware patterns
- [[03 - Maps Sets and WeakVariants]] — WeakMap/WeakSet for leak-free caching
- [[07 - DOM Observers]] — `IntersectionObserver` for lazy loading

---

**Navigation:**
← [[04 - Testing JavaScript]] | [[01 - Phase 10 - Overview]] →
