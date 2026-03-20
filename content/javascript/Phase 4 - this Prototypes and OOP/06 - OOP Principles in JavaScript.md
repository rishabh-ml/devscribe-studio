---
title: OOP Principles in JavaScript
phase: 4
topic: OOP Principles in JavaScript
tags: [javascript, oop, encapsulation, abstraction, polymorphism, inheritance, solid, composition]
created: 2025-01-15
---

# OOP Principles in JavaScript

> [!info] **Big Picture**
> The four pillars of OOP — **encapsulation**, **abstraction**, **polymorphism**, and **inheritance** — apply to JavaScript, but with a prototypal twist. JavaScript also favors **composition over inheritance** more strongly than traditional OOP languages. Understanding both classical OOP principles and JavaScript's idiomatic patterns makes you a flexible, pragmatic developer.

---

## The Four Pillars

### 1. Encapsulation

**Hiding internal state** and exposing a controlled public interface.

```js
class ShoppingCart {
  #items = [];        // private — hidden from outside
  #discountRate = 0;

  addItem(product, quantity = 1) {
    this.#items.push({ product, quantity });
  }

  removeItem(productId) {
    this.#items = this.#items.filter(i => i.product.id !== productId);
  }

  setDiscount(rate) {
    if (rate < 0 || rate > 1) throw new RangeError("Rate must be 0–1");
    this.#discountRate = rate;
  }

  get total() {
    const subtotal = this.#items.reduce(
      (sum, { product, quantity }) => sum + product.price * quantity, 0
    );
    return subtotal * (1 - this.#discountRate);
  }

  get itemCount() {
    return this.#items.reduce((sum, { quantity }) => sum + quantity, 0);
  }
}

const cart = new ShoppingCart();
cart.addItem({ id: 1, name: "Book", price: 20 }, 2);
cart.setDiscount(0.1);
cart.total;       // 36 (40 - 10%)
cart.itemCount;   // 2
cart.#items;      // ❌ SyntaxError — private!
```

> [!tip] **Why Encapsulate?**
> - Prevents invalid state (validation in setters)
> - Allows changing internal representation without breaking outside code
> - Makes the public API clear and intentional

### 2. Abstraction

**Hiding complexity** behind a simple interface. Users don't need to know *how* something works — just *what* it does.

```js
class EmailService {
  async send(to, subject, body) {
    const html = this.#renderTemplate(body);
    const sanitized = this.#sanitize(html);
    const headers = this.#buildHeaders(to, subject);
    await this.#transmit(headers, sanitized);
  }

  // Complex internals hidden
  #renderTemplate(body) { /* ... */ }
  #sanitize(html) { /* ... */ }
  #buildHeaders(to, subject) { /* ... */ }
  #transmit(headers, body) { /* ... */ }
}

// User only needs to know: emailService.send(to, subject, body)
const email = new EmailService();
email.send("alice@example.com", "Welcome!", "Thank you for joining.");
```

### 3. Polymorphism

**Different classes responding to the same method name** in different ways. The caller doesn't need to know the specific type.

```js
class Shape {
  area() {
    throw new Error("area() must be implemented");
  }

  describe() {
    return `Area: ${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(radius) { super(); this.radius = radius; }
  area() { return Math.PI * this.radius ** 2; }
}

class Rectangle extends Shape {
  constructor(w, h) { super(); this.width = w; this.height = h; }
  area() { return this.width * this.height; }
}

class Triangle extends Shape {
  constructor(base, height) { super(); this.base = base; this.height = height; }
  area() { return 0.5 * this.base * this.height; }
}

// Polymorphism in action — same method, different behavior
const shapes = [new Circle(5), new Rectangle(4, 6), new Triangle(3, 8)];

// The caller doesn't care WHICH shape — they all respond to area()
const totalArea = shapes.reduce((sum, shape) => sum + shape.area(), 0);
shapes.forEach(s => console.log(s.describe()));
// "Area: 78.54"
// "Area: 24.00"
// "Area: 12.00"
```

#### Duck Typing

JavaScript also supports **informal polymorphism** — if an object has the expected method, it works, regardless of its class:

```js
// These don't share a class hierarchy, but they all "quack" (have speak())
const entities = [
  { speak() { return "Woof"; } },
  { speak() { return "Meow"; } },
  { speak() { return "Hello"; } },
];

entities.forEach(e => console.log(e.speak())); // "Woof", "Meow", "Hello"
```

### 4. Inheritance

**Sharing behavior** through a parent-child relationship (prototype chain).

```js
class Vehicle {
  constructor(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
  }

  describe() {
    return `${this.year} ${this.make} ${this.model}`;
  }
}

class ElectricCar extends Vehicle {
  constructor(make, model, year, range) {
    super(make, model, year);
    this.range = range;
  }

  describe() {
    return `${super.describe()} (${this.range}mi range)`;
  }
}

const tesla = new ElectricCar("Tesla", "Model 3", 2024, 358);
tesla.describe(); // "2024 Tesla Model 3 (358mi range)"
```

> [!warning] **Inheritance Pitfalls**
> - Deep hierarchies are fragile — changes to parents ripple to all children
> - "Gorilla-banana problem" — You wanted a banana, but you got a gorilla holding the banana and the entire jungle
> - Tight coupling between parent and child

---

## SOLID Principles in JavaScript

### S — Single Responsibility

Every class/module should have **one reason to change**.

```js
// ❌ Too many responsibilities
class UserManager {
  createUser(data) { /* ... */ }
  sendWelcomeEmail(user) { /* ... */ }
  generateReport(users) { /* ... */ }
  validateUserData(data) { /* ... */ }
}

// ✅ Separated concerns
class UserRepository {
  create(data) { /* ... */ }
  findById(id) { /* ... */ }
}

class EmailService {
  sendWelcome(user) { /* ... */ }
}

class UserValidator {
  validate(data) { /* ... */ }
}
```

### O — Open/Closed

**Open for extension, closed for modification.** Add new behavior without modifying existing code.

```js
// ❌ Must modify calculateArea every time you add a shape
function calculateArea(shape) {
  if (shape.type === "circle") return Math.PI * shape.radius ** 2;
  if (shape.type === "rectangle") return shape.width * shape.height;
  // Must add new if-clause for every shape...
}

// ✅ Open/closed — new shapes just implement area()
class Circle { area() { return Math.PI * this.radius ** 2; } }
class Rectangle { area() { return this.width * this.height; } }
// Add new shapes without modifying existing code
class Hexagon { area() { /* ... */ } }
```

### L — Liskov Substitution

Subtypes must be **substitutable** for their parent types without breaking behavior.

```js
// ❌ Violates LSP — Square can't honor Rectangle's contract
class Rectangle {
  constructor(w, h) { this.width = w; this.height = h; }
  setWidth(w) { this.width = w; }
  setHeight(h) { this.height = h; }
  area() { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(w) { this.width = this.height = w; } // breaks expectation!
  setHeight(h) { this.width = this.height = h; }
}

// Code expecting a Rectangle breaks with a Square:
function doubleWidth(rect) {
  rect.setWidth(rect.width * 2);
  return rect.area(); // expects width * original height
}
// With Square, height changes too — unexpected!
```

### I — Interface Segregation

Prefer **specific interfaces** over general ones. Don't force classes to implement methods they don't use.

```js
// ❌ Fat interface — Printer shouldn't need scan() or fax()
class AllInOneMachine {
  print() { }
  scan() { }
  fax() { }
}

// ✅ Separated — implement only what you need
const Printable = (Base) => class extends Base {
  print() { /* ... */ }
};

const Scannable = (Base) => class extends Base {
  scan() { /* ... */ }
};

class BasicPrinter extends Printable(Object) {}
class MultiFunctionPrinter extends Printable(Scannable(Object)) {}
```

### D — Dependency Inversion

Depend on **abstractions**, not concretions.

```js
// ❌ Depends on a specific database implementation
class UserService {
  constructor() {
    this.db = new MySQLDatabase(); // tightly coupled
  }
}

// ✅ Depends on an abstraction (injected)
class UserService {
  constructor(database) {
    this.db = database; // any database that has .find(), .save(), etc.
  }

  async getUser(id) {
    return this.db.find("users", id);
  }
}

// Inject different implementations
new UserService(new MySQLDatabase());
new UserService(new MongoDatabase());
new UserService(new InMemoryDatabase()); // for testing!
```

---

## Composition Over Inheritance

> [!quote] **"Favor object composition over class inheritance"** — Gang of Four

Instead of deep class hierarchies, build objects from **small, focused pieces**.

```js
// ❌ Inheritance — rigid hierarchy
class Animal { }
class FlyingAnimal extends Animal { fly() {} }
class SwimmingAnimal extends Animal { swim() {} }
// What about a duck that flies AND swims? Multiple inheritance isn't possible.

// ✅ Composition — mix behaviors freely
const canFly = (obj) => ({
  ...obj,
  fly() { console.log(`${obj.name} is flying`); },
});

const canSwim = (obj) => ({
  ...obj,
  swim() { console.log(`${obj.name} is swimming`); },
});

const canWalk = (obj) => ({
  ...obj,
  walk() { console.log(`${obj.name} is walking`); },
});

// Compose behavior:
function createDuck(name) {
  return canWalk(canSwim(canFly({ name })));
}

function createPenguin(name) {
  return canWalk(canSwim({ name }));
}

const donald = createDuck("Donald");
donald.fly();  // "Donald is flying"
donald.swim(); // "Donald is swimming"
donald.walk(); // "Donald is walking"

const tux = createPenguin("Tux");
tux.swim(); // "Tux is swimming"
tux.walk(); // "Tux is walking"
tux.fly;    // undefined — penguins can't fly!
```

### When to Use Inheritance vs Composition

| Criterion | Inheritance | Composition |
|---|---|---|
| Relationship | "is-a" (Dog IS an Animal) | "has-a" / "can-do" (Dog HAS swimming ability) |
| Hierarchy | Fixed, single chain | Flexible, mix-and-match |
| Coupling | Tight (parent changes affect children) | Loose (behaviors are independent) |
| Reuse | Down the hierarchy | Across any object |
| Best for | Stable, narrow hierarchies | Cross-cutting behaviors |

> [!tip] **Rule of Thumb**
> Start with composition. Use inheritance only when there's a clear, stable "is-a" relationship (e.g., `HttpError extends Error`).

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Over-engineering** — Not everything needs a class. Simple objects and functions are often enough.
> 2. **Deep hierarchies** — More than 2–3 levels is usually a sign to use composition instead.
> 3. **"God classes"** — Classes with dozens of methods violate Single Responsibility.
> 4. **Forced patterns** — Don't use OOP patterns just because they exist. Use them when they solve a real problem.
> 5. **JavaScript is multi-paradigm** — The best JS code often mixes OOP, functional, and procedural styles.

---

## Related Topics

- [[05 - ES6 Classes]] — Syntax for implementing OOP in JavaScript
- [[03 - Prototypes and the Prototype Chain]] — How inheritance actually works under the hood
- [[06 - Closures]] — Alternative to private fields for encapsulation (factory functions)
- [[09 - Function Composition and Functional Patterns]] — Functional alternative to class hierarchies

---

**Navigation:**
← [[05 - ES6 Classes]] | [[01 - Phase 4 - Overview]] | Phase 5 → [[01 - Phase 5 - Overview]]
