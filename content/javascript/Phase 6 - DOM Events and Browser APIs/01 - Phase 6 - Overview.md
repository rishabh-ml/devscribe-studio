---
title: Phase 6 - Overview
phase: 6
topic: DOM, Events, Browser APIs, and Network Requests
tags: [javascript, dom, events, browser-apis, fetch, phase-overview]
created: 2025-01-15
---

# Phase 6 — DOM, Events, Browser APIs, and Network Requests

> [!info] **Weeks 14–18 · The Browser Layer**
> This phase transitions from pure language knowledge to real-world browser programming. You'll learn to manipulate web pages, handle user interaction, store data client-side, and communicate with servers. Everything in the browser runs through these APIs.

---

## Topics in This Phase

| # | Topic | Core Concepts |
|---|---|---|
| 1 | [[02 - DOM Tree and Traversal]] | Node types, parent/child/sibling, `NodeList` vs `HTMLCollection` |
| 2 | [[03 - Selecting Elements]] | `getElementById`, `querySelector`, `querySelectorAll`, `closest`, `matches` |
| 3 | [[04 - Creating and Modifying Elements]] | `createElement`, `append`, `remove`, `innerHTML` vs `textContent`, `cloneNode` |
| 4 | [[05 - Attributes Classes and Styles]] | `getAttribute`, `dataset`, `classList`, `style`, `getComputedStyle`, geometry |
| 5 | [[06 - Events]] | `addEventListener`, event object, bubbling/capturing, delegation, custom events |
| 6 | [[07 - DOM Observers]] | `MutationObserver`, `IntersectionObserver`, `ResizeObserver` |
| 7 | [[08 - Browser Data Storage]] | `localStorage`, `sessionStorage`, cookies, IndexedDB |
| 8 | [[09 - Fetch API and Network Requests]] | `fetch`, HTTP methods, headers, CORS, `FormData`, `URL`/`URLSearchParams` |
| 9 | [[10 - Browser APIs]] | History, Geolocation, Notifications, Clipboard, Canvas, Visibility |
| 10 | [[11 - Script Loading]] | `defer`, `async`, dynamic loading, `preload`/`prefetch` |

---

## Learning Objectives

By the end of Phase 6 you will be able to:

- Traverse and manipulate the DOM tree programmatically
- Build interactive UIs with event listeners, delegation, and custom events
- Observe DOM changes, element visibility, and element resizing
- Store and retrieve data client-side (localStorage, cookies, IndexedDB)
- Make HTTP requests with `fetch`, handle responses, and deal with CORS
- Use essential browser APIs (History, Clipboard, Canvas, etc.)
- Understand script loading strategies for optimal page performance

---

## Mental Model

```
               ┌──────────────────────────────┐
               │       Browser Window          │
               │  ┌───────────────────────┐    │
               │  │     DOM Tree           │    │
        User ──┼──│  (HTML → Nodes)        │    │
    Interaction│  │  Traverse / Select /    │    │
               │  │  Create / Modify       │    │
               │  └───────────┬───────────┘    │
               │              │                 │
               │  ┌───────────▼───────────┐    │
               │  │    Events System        │    │
               │  │  Capture → Target →     │    │
               │  │  Bubble → Delegation    │    │
               │  └───────────┬───────────┘    │
               │              │                 │
               │  ┌───────────▼───────────┐    │
               │  │   Browser APIs         │    │
               │  │  Storage │ Fetch │ etc. │    │
               │  └───────────────────────┘    │
               └──────────────────────────────┘
```

---

## 🛠️ Suggested Practice

> [!tip] Build While You Learn
> DOM skills require hands-on building. Create small interactive features after each topic.

1. **Interactive Todo App** — Full CRUD with DOM manipulation, event delegation, and localStorage persistence.
2. **Infinite Scroll** — Use IntersectionObserver to lazy-load content as the user scrolls.
3. **Form Validator** — Build a registration form with real-time validation using input events and Constraint Validation API.
4. **Drag & Drop Kanban** — Create a kanban board with draggable cards between columns using mouse events.
5. **Theme Switcher** — Toggle dark/light mode with CSS custom properties, save preference in localStorage.

---

## Resources

- **javascript.info** Part 2: "Browser: Document, Events, Interfaces"
- **MDN Web Docs** — "Web APIs" section
- **freeCodeCamp** — Todo App (localStorage), Calorie Counter (form validation/events)
- **The Odin Project** — DOM manipulation and async APIs section

---

**Navigation:**
← [[01 - Phase 5 - Overview]] | [[02 - DOM Tree and Traversal]] →
