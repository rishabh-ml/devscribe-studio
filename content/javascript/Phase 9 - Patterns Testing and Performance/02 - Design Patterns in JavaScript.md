---
title: Design Patterns in JavaScript
phase: 9
topic: Design Patterns
tags: [javascript, design-patterns, creational, structural, behavioral, singleton, factory, observer, module, decorator]
created: 2025-01-15
---

# Design Patterns in JavaScript

> [!info] **Big Picture**
> Design patterns are proven, reusable solutions to common software design problems. They give developers a shared vocabulary ("We used the Observer pattern here") and help structure code for maintainability. JavaScript's flexibility (functions as values, prototypes, closures) means patterns often look different than in class-based languages.

---

## Creational Patterns

### Singleton

One instance shared across the entire application.

```js
// ES Module Singleton (simplest — modules are cached)
// config.js
class Config {
  #settings = {};

  set(key, value) {
    this.#settings[key] = value;
  }

  get(key) {
    return this.#settings[key];
  }
}

export const config = new Config(); // single instance, always

// Any file importing config gets the SAME object
```

```js
// Class-based Singleton (explicit)
class Database {
  static #instance;

  constructor(url) {
    if (Database.#instance) {
      return Database.#instance;
    }
    this.url = url;
    this.connection = null;
    Database.#instance = this;
  }

  connect() {
    this.connection = `Connected to ${this.url}`;
    return this;
  }

  static getInstance(url) {
    if (!Database.#instance) {
      Database.#instance = new Database(url);
    }
    return Database.#instance;
  }
}

const db1 = Database.getInstance("postgres://localhost");
const db2 = Database.getInstance("mysql://other");
db1 === db2; // true — same instance
```

**When to use**: App configuration, database connections, logging services, state stores.

---

### Factory

Creates objects without specifying the exact class. Centralizes creation logic.

```js
// Simple Factory
function createUser(type, data) {
  switch (type) {
    case "admin":
      return { ...data, role: "admin", permissions: ["read", "write", "delete"] };
    case "editor":
      return { ...data, role: "editor", permissions: ["read", "write"] };
    case "viewer":
      return { ...data, role: "viewer", permissions: ["read"] };
    default:
      throw new Error(`Unknown user type: ${type}`);
  }
}

const admin = createUser("admin", { name: "Alice" });
const viewer = createUser("viewer", { name: "Bob" });
```

```js
// Class-based Factory
class Notification {
  constructor(message) {
    this.message = message;
  }
}

class EmailNotification extends Notification {
  send() { console.log(`📧 Email: ${this.message}`); }
}

class SMSNotification extends Notification {
  send() { console.log(`📱 SMS: ${this.message}`); }
}

class PushNotification extends Notification {
  send() { console.log(`🔔 Push: ${this.message}`); }
}

class NotificationFactory {
  static create(type, message) {
    const types = {
      email: EmailNotification,
      sms: SMSNotification,
      push: PushNotification
    };
    const NotifClass = types[type];
    if (!NotifClass) throw new Error(`Unknown type: ${type}`);
    return new NotifClass(message);
  }
}

NotificationFactory.create("email", "Hello!").send(); // 📧 Email: Hello!
```

**When to use**: Creating objects based on runtime conditions, hiding complex construction logic.

---

### Builder

Step-by-step construction of complex objects. Fluent API pattern.

```js
class QueryBuilder {
  #table = "";
  #conditions = [];
  #orderBy = null;
  #limit = null;
  #fields = ["*"];

  from(table) {
    this.#table = table;
    return this;
  }

  select(...fields) {
    this.#fields = fields;
    return this;
  }

  where(condition) {
    this.#conditions.push(condition);
    return this;
  }

  orderBy(field, direction = "ASC") {
    this.#orderBy = `${field} ${direction}`;
    return this;
  }

  limit(n) {
    this.#limit = n;
    return this;
  }

  build() {
    let query = `SELECT ${this.#fields.join(", ")} FROM ${this.#table}`;
    if (this.#conditions.length) {
      query += ` WHERE ${this.#conditions.join(" AND ")}`;
    }
    if (this.#orderBy) query += ` ORDER BY ${this.#orderBy}`;
    if (this.#limit) query += ` LIMIT ${this.#limit}`;
    return query;
  }
}

const query = new QueryBuilder()
  .from("users")
  .select("name", "email")
  .where("active = true")
  .where("age > 18")
  .orderBy("name")
  .limit(10)
  .build();
// "SELECT name, email FROM users WHERE active = true AND age > 18 ORDER BY name ASC LIMIT 10"
```

**When to use**: Complex object construction with many optional parameters, fluent APIs.

---

## Structural Patterns

### Module Pattern

Encapsulate private state, expose public API. Before ES modules, this was THE pattern.

```js
// IIFE Module (pre-ES modules)
const Counter = (() => {
  let count = 0; // private

  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
})();

Counter.increment(); // 1
Counter.increment(); // 2
Counter.getCount();  // 2
// Counter.count → undefined (private)

// Modern: ES modules are the Module pattern
// counter.js
let count = 0; // module-scoped = private
export const increment = () => ++count;
export const getCount = () => count;
```

### Revealing Module Pattern

Variant where all logic is private, and you explicitly choose what to reveal.

```js
const Calculator = (() => {
  let memory = 0;

  function add(a, b) { return a + b; }
  function subtract(a, b) { return a - b; }
  function store(val) { memory = val; }
  function recall() { return memory; }

  // Reveal only chosen members
  return { add, subtract, store, recall };
})();
```

---

### Decorator Pattern

Dynamically add behavior to objects without modifying their class.

```js
// Function Decorator (most common in JS)
function withLogging(fn) {
  return function (...args) {
    console.log(`Calling ${fn.name}(${args.join(", ")})`);
    const result = fn.apply(this, args);
    console.log(`Result: ${result}`);
    return result;
  };
}

function add(a, b) { return a + b; }
const loggedAdd = withLogging(add);
loggedAdd(2, 3);
// "Calling add(2, 3)"
// "Result: 5"

// Stacking decorators
function withTiming(fn) {
  return function (...args) {
    const start = performance.now();
    const result = fn.apply(this, args);
    console.log(`${fn.name} took ${(performance.now() - start).toFixed(2)}ms`);
    return result;
  };
}

const enhancedAdd = withLogging(withTiming(add));
```

```js
// Object Decorator
function withTimestamp(obj) {
  return {
    ...obj,
    createdAt: new Date(),
    getAge() {
      return Date.now() - this.createdAt.getTime();
    }
  };
}

const user = withTimestamp({ name: "Alice" });
user.createdAt; // Date object
```

> [!note] **TC39 Decorators** (Stage 3) — A native `@decorator` syntax is coming:
> ```js
> @logged
> class MyClass {
>   @memoize
>   expensiveMethod() { ... }
> }
> ```

---

### Facade Pattern

Provide a simplified interface to a complex subsystem.

```js
// Complex subsystem
class AudioContext { /* ... */ }
class AudioBuffer { /* ... */ }
class GainNode { /* ... */ }

// Facade — simple API
class SoundPlayer {
  #context;
  #gainNode;

  constructor() {
    this.#context = new AudioContext();
    this.#gainNode = this.#context.createGain();
    this.#gainNode.connect(this.#context.destination);
  }

  async play(url, volume = 1) {
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    const buffer = await this.#context.decodeAudioData(data);
    const source = this.#context.createBufferSource();
    source.buffer = buffer;
    this.#gainNode.gain.value = volume;
    source.connect(this.#gainNode);
    source.start();
  }

  setVolume(level) {
    this.#gainNode.gain.value = level;
  }
}

// Consumer only sees simple API
const player = new SoundPlayer();
player.play("/sounds/click.mp3", 0.5);
```

**When to use**: Wrapping complex browser APIs, third-party libraries, or multi-step workflows.

---

### Adapter Pattern

Make incompatible interfaces work together.

```js
// Old API
class OldAnalytics {
  trackEvent(category, action, label) {
    console.log(`[Old] ${category} > ${action}: ${label}`);
  }
}

// New API
class NewAnalytics {
  send(event) {
    console.log(`[New] ${JSON.stringify(event)}`);
  }
}

// Adapter — makes NewAnalytics look like OldAnalytics
class AnalyticsAdapter {
  #analytics;

  constructor(newAnalytics) {
    this.#analytics = newAnalytics;
  }

  trackEvent(category, action, label) {
    this.#analytics.send({ category, action, label, timestamp: Date.now() });
  }
}

// Existing code works without changes
const analytics = new AnalyticsAdapter(new NewAnalytics());
analytics.trackEvent("UI", "click", "submit-btn");
```

---

## Behavioral Patterns

### Observer / PubSub

Event-driven communication — one-to-many dependency between objects.

```js
class EventEmitter {
  #events = new Map();

  on(event, handler) {
    if (!this.#events.has(event)) {
      this.#events.set(event, new Set());
    }
    this.#events.get(event).add(handler);
    return () => this.off(event, handler); // return unsubscribe function
  }

  off(event, handler) {
    this.#events.get(event)?.delete(handler);
  }

  emit(event, ...args) {
    this.#events.get(event)?.forEach(handler => handler(...args));
  }

  once(event, handler) {
    const wrapper = (...args) => {
      handler(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// Usage
const emitter = new EventEmitter();

const unsubscribe = emitter.on("userLogin", user => {
  console.log(`${user.name} logged in`);
});

emitter.emit("userLogin", { name: "Alice" }); // "Alice logged in"
unsubscribe(); // cleanup
```

**When to use**: Decoupled communication, event systems, reactive UI updates. This is the foundation of Node.js EventEmitter, DOM events, and frameworks like React/Vue.

---

### Mediator

Centralized communication hub — objects communicate through a mediator instead of directly.

```js
class ChatRoom {
  #users = new Map();

  register(user) {
    this.#users.set(user.name, user);
    user.chatRoom = this;
  }

  send(message, from, to) {
    if (to) {
      // Direct message
      this.#users.get(to)?.receive(message, from);
    } else {
      // Broadcast
      this.#users.forEach((user, name) => {
        if (name !== from) user.receive(message, from);
      });
    }
  }
}

class User {
  constructor(name) {
    this.name = name;
    this.chatRoom = null;
  }

  send(message, to) {
    this.chatRoom.send(message, this.name, to);
  }

  receive(message, from) {
    console.log(`${this.name} received from ${from}: ${message}`);
  }
}

const room = new ChatRoom();
const alice = new User("Alice");
const bob = new User("Bob");
room.register(alice);
room.register(bob);

alice.send("Hello!", "Bob");   // Bob receives: "Hello!"
bob.send("Hi everyone!");      // Alice receives: "Hi everyone!"
```

---

### Command Pattern

Encapsulate actions as objects — enables undo/redo, queuing, logging.

```js
class CommandManager {
  #history = [];
  #undone = [];

  execute(command) {
    command.execute();
    this.#history.push(command);
    this.#undone = []; // clear redo stack
  }

  undo() {
    const command = this.#history.pop();
    if (command) {
      command.undo();
      this.#undone.push(command);
    }
  }

  redo() {
    const command = this.#undone.pop();
    if (command) {
      command.execute();
      this.#history.push(command);
    }
  }
}

// Concrete commands
class AddTextCommand {
  constructor(editor, text) {
    this.editor = editor;
    this.text = text;
  }
  execute() { this.editor.content += this.text; }
  undo() { this.editor.content = this.editor.content.slice(0, -this.text.length); }
}

class DeleteTextCommand {
  constructor(editor, count) {
    this.editor = editor;
    this.count = count;
    this.deleted = "";
  }
  execute() {
    this.deleted = this.editor.content.slice(-this.count);
    this.editor.content = this.editor.content.slice(0, -this.count);
  }
  undo() { this.editor.content += this.deleted; }
}

// Usage
const editor = { content: "" };
const manager = new CommandManager();

manager.execute(new AddTextCommand(editor, "Hello "));
manager.execute(new AddTextCommand(editor, "World"));
editor.content; // "Hello World"

manager.undo();
editor.content; // "Hello "

manager.redo();
editor.content; // "Hello World"
```

---

### Strategy Pattern

Define a family of algorithms and make them interchangeable.

```js
// Strategies
const strategies = {
  fedex: (weight) => weight * 3.50 + 5,
  ups: (weight) => weight * 2.80 + 8,
  usps: (weight) => weight * 2.00 + 12,
};

// Context
class ShippingCalculator {
  #strategy;

  setStrategy(carrier) {
    this.#strategy = strategies[carrier];
    if (!this.#strategy) throw new Error(`Unknown carrier: ${carrier}`);
  }

  calculate(weight) {
    return this.#strategy(weight);
  }
}

const calc = new ShippingCalculator();
calc.setStrategy("fedex");
calc.calculate(10); // 40

calc.setStrategy("usps");
calc.calculate(10); // 32
```

**When to use**: When you have multiple algorithms for the same task (sorting, validation, pricing, formatting).

---

### State Pattern

Object behavior changes based on internal state.

```js
class TrafficLight {
  #states = {
    green: {
      color: "green",
      next: "yellow",
      duration: 30000,
      action: () => console.log("🟢 GO")
    },
    yellow: {
      color: "yellow",
      next: "red",
      duration: 5000,
      action: () => console.log("🟡 CAUTION")
    },
    red: {
      color: "red",
      next: "green",
      duration: 20000,
      action: () => console.log("🔴 STOP")
    }
  };

  #current;

  constructor(initial = "red") {
    this.#current = this.#states[initial];
  }

  change() {
    this.#current = this.#states[this.#current.next];
    this.#current.action();
    return this;
  }

  get state() { return this.#current.color; }
}

const light = new TrafficLight();
light.change(); // 🟢 GO
light.change(); // 🟡 CAUTION
light.change(); // 🔴 STOP
```

---

## Anti-Patterns to Avoid

> [!danger] **Common Anti-Patterns**
> 1. **God Object** — One class/module that does everything. Split into focused modules.
> 2. **Callback Hell** — Deeply nested callbacks. Use Promises/async-await.
> 3. **Tight Coupling** — Modules depending on each other's internals. Use events/interfaces.
> 4. **Premature Optimization** — Optimizing before measuring. Profile first, optimize second.
> 5. **Copy-Paste Programming** — Duplicated code. Extract shared functions/modules.
> 6. **Magic Numbers/Strings** — Unexplained literals in code. Use named constants.
> 7. **Overengineering** — Applying patterns where a simple function would suffice.

---

## MVC / MVVM

```
MVC (Model-View-Controller):
┌─────────┐    ┌────────────┐    ┌──────┐
│  Model  │◄───│ Controller │◄───│ View │ (user input)
│  (data) │───►│  (logic)   │───►│ (UI) │ (display)
└─────────┘    └────────────┘    └──────┘

MVVM (Model-View-ViewModel):
┌─────────┐    ┌───────────┐    ┌──────┐
│  Model  │◄──►│ ViewModel │◄──►│ View │
│  (data) │    │ (binding)  │    │ (UI) │
└─────────┘    └───────────┘    └──────┘
  Two-way data binding (Vue, Angular)
```

---

## 🎯 Practice Exercises

1. **Singleton Logger** — Implement a `Logger` singleton (module-level or class-based) with `log()`, `warn()`, `error()` methods. Ensure only one instance exists across imports.
2. **Observer Pattern** — Build an `EventEmitter` class with `on(event, fn)`, `off(event, fn)`, and `emit(event, ...data)`. Test with a chat room that notifies users of new messages.
3. **Factory Pattern** — Create a `UIComponentFactory` that takes a type string (`"button"`, `"input"`, `"modal"`) and returns the appropriate component object with `render()` and `destroy()` methods.
4. **Strategy Pattern** — Implement a `Validator` that accepts different validation strategies (email, phone, URL). Users can swap strategies at runtime.
5. **Decorator Pattern** — Write a `withLogging(fn)` decorator that wraps any function, logging its arguments and return value. Apply it to 3 different functions.

---

## Related Topics

- [[07 - Higher-Order Functions]] — Decorator and Strategy patterns use HOFs
- [[06 - Closures]] — Module pattern relies on closures
- [[02 - ES Modules]] — Modern module pattern
- [[04 - Proxy and Reflect]] — Proxy design pattern at the language level
- [[06 - Events]] — Observer pattern in the DOM

---

**Navigation:**
← [[01 - Phase 9 - Overview]] | [[03 - Functional Programming]] →
