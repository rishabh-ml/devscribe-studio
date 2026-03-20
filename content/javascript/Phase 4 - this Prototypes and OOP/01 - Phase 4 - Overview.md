---
title: Phase 4 - The this Keyword, Prototypes and OOP
phase: 4
topic: overview
tags: [javascript, this, prototypes, oop, classes, inheritance, phase4]
created: 2025-01-15
---

# Phase 4 — The `this` Keyword, Prototypes & OOP (Weeks 8–11)

> [!info] **Why This Phase Matters**
> `this` is JavaScript's most misunderstood keyword. Prototypes are the engine behind inheritance. Classes are syntactic sugar over prototypes that make OOP accessible. Together, these concepts explain how JavaScript objects actually work — not how they appear to work on the surface. Understanding this phase means you'll never be confused by `this` losing its binding, by prototype chain lookups, or by class inheritance subtleties again.

---

## Topics in This Phase

| # | Topic | Key Concepts |
|---|---|---|
| 1 | [[02 - The this Keyword]] | Global, method, constructor, arrow, explicit binding rules |
| 2 | [[03 - Prototypes and the Prototype Chain]] | `[[Prototype]]`, prototype chain, `Object.create()`, `instanceof` |
| 3 | [[04 - Constructor Functions]] | The `new` keyword steps, `hasOwnProperty`, constructor patterns |
| 4 | [[05 - ES6 Classes]] | Class syntax, fields, private members, getters/setters, inheritance, mixins |
| 5 | [[06 - OOP Principles in JavaScript]] | Encapsulation, abstraction, polymorphism, inheritance, SOLID, composition |

---

## Learning Objectives

By the end of Phase 4, you should be able to:

- [ ] Predict the value of `this` in any situation (5 binding rules)
- [ ] Explain the prototype chain and how property lookup works
- [ ] Describe exactly what `new` does (all 5 steps)
- [ ] Write classes with private fields, static methods, and inheritance
- [ ] Apply OOP principles and know when to prefer composition over inheritance

---

## The Mental Model

```
┌─────── Binding Rules for `this` ──────────────────────┐
│                                                       │
│  1. new → newly created object                        │
│  2. call/apply/bind → specified object                │
│  3. obj.method() → obj                                │
│  4. standalone fn → globalThis (or undefined strict)   │
│  5. arrow fn → inherits from enclosing scope          │
│                                                       │
│  Priority: new > explicit > implicit > default        │
└───────────────────────────────────────────────────────┘

┌─────── Prototype Chain ───────────────────────────────┐
│                                                       │
│  instance → Constructor.prototype → Object.prototype → null
│                                                       │
│  Property lookup walks UP the chain until found       │
└───────────────────────────────────────────────────────┘
```

---

## 🛠️ Suggested Practice

> [!tip] Build While You Learn
> After each topic, write small experiments in the console. After finishing Phase 4, build a class-based project to cement OOP patterns.

1. **`this` Binding Lab** — Write examples of all 5 binding rules (default, implicit, explicit, `new`, arrow). Predict `this` before running.
2. **Prototype Visualizer** — Build a function `getPrototypeChain(obj)` that walks up the chain and prints each prototype.
3. **Class Hierarchy** — Create an `Animal → Dog → GuideDog` class hierarchy with `super()` calls and method overriding.
4. **Composition vs Inheritance** — Rewrite the class hierarchy above using object composition (`canWalk`, `canBark` mixins). Compare the two approaches.
5. **Mini ORM** — Build a simple `Model` base class with `save()`, `find()`, and `delete()` methods using a Map as an in-memory store.

---

## Resources

| Resource | Type | Notes |
|---|---|---|
| **Frontend Masters: "Deep JS Foundations, v3"** | Course | Definitive course on `this`, prototypes, coercion |
| **javascript.info** Ch. 7–9 | Tutorial | Object config, prototypes, classes |
| **"You Don't Know JS Yet"** | Book (free) | Deep `this` and prototypes coverage |
| **Web Dev Simplified** | YouTube | `this` and OOP video series |

---

**Navigation:**
← [[01 - Phase 3 - Overview]] | [[_Index]] | Next: [[02 - The this Keyword]]
