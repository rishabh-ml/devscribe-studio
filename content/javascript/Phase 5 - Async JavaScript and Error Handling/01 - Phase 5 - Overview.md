---
title: Phase 5 - Asynchronous JavaScript and Error Handling
phase: 5
topic: overview
tags: [javascript, async, promises, event-loop, error-handling, phase5]
created: 2025-01-15
---

# Phase 5 — Asynchronous JavaScript & Error Handling (Weeks 11–14)

> [!info] **Why This Phase Matters**
> Async JavaScript is where most learners stumble — and where the real power of the language lives. Every network request, every user interaction, every timer, every file read is asynchronous. Understanding the event loop, Promises, and async/await is **essential for building any real application**. This phase builds understanding from the ground up: how JS executes code → callbacks → Promises → async/await → error handling.

---

## Topics in This Phase

| # | Topic | Key Concepts |
|---|---|---|
| 1 | [[02 - The Event Loop]] | Call stack, Web APIs, macrotasks, microtasks, execution order |
| 2 | [[03 - Promises]] | States, chaining, `.then/.catch/.finally`, `Promise.all/race/any/allSettled` |
| 3 | [[04 - Async Await]] | `async` functions, `await`, parallel execution, top-level await |
| 4 | [[05 - Error Handling]] | `try/catch/finally`, custom errors, `error.cause`, async error patterns |
| 5 | [[06 - Timers and Scheduling]] | `setTimeout`, `setInterval`, `requestAnimationFrame`, `AbortController` |

---

## Learning Objectives

By the end of Phase 5, you should be able to:

- [ ] Draw the event loop and explain microtask vs macrotask priority
- [ ] Create, chain, and compose Promises fluently
- [ ] Convert callback-based code to Promises and async/await
- [ ] Handle errors properly in both sync and async code
- [ ] Use `AbortController` to cancel async operations
- [ ] Avoid common async pitfalls (sequential vs parallel, unhandled rejections)

---

## The Mental Model

```
┌───────────────────────────────────────────────────────┐
│                    CALL STACK                         │
│  (executes one function at a time — single thread)    │
└────────────────┬──────────────────────────────────────┘
                 │ when empty, check queues ↓
┌────────────────▼──────────────────────────────────────┐
│              MICROTASK QUEUE                          │
│  Promise .then/.catch, queueMicrotask()              │
│  (ALL drained before any macrotask)                   │
└────────────────┬──────────────────────────────────────┘
                 │ when empty, take ONE macrotask ↓
┌────────────────▼──────────────────────────────────────┐
│              MACROTASK QUEUE                          │
│  setTimeout, setInterval, I/O, UI events              │
│  (ONE at a time, then drain microtasks again)         │
└───────────────────────────────────────────────────────┘
```

---

## 🛠️ Suggested Practice

> [!tip] Build While You Learn
> Async concepts click only through practice. Build small async projects after each topic.

1. **Promise Chain** — Chain 3 API calls where each depends on the previous result. Refactor from `.then()` to `async/await`.
2. **Error Boundary** — Write an async function with `try/catch` that retries a failing fetch 3 times with exponential backoff.
3. **Parallel vs Sequential** — Fetch 5 URLs both sequentially (loop + await) and in parallel (`Promise.all`). Compare timing.
4. **Custom setTimeout Promise** — Write `delay(ms)` that returns a Promise resolving after `ms` milliseconds. Use it to build a traffic light simulator.
5. **Mini Task Queue** — Build a queue that processes async tasks one at a time, with `add(task)` and `onComplete` events.

---

## Resources

| Resource | Type | Notes |
|---|---|---|
| **Frontend Masters: "The Hard Parts of Async JS"** | Course | Ground-up mental model of event loop and Promises |
| **javascript.info** Ch. 11 | Tutorial | Promises, async/await |
| **Jonas Schmedtmann's Udemy** | Course | Sections on "Behind the Scenes" and "Async JS" |
| **Fireship** YouTube | Video | "Promise in 100 Seconds", "Async Await" |

---

**Navigation:**
← [[01 - Phase 4 - Overview]] | [[_Index]] | Next: [[02 - The Event Loop]]
