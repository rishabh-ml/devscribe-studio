---
title: Testing JavaScript
phase: 9
topic: Testing
tags: [javascript, testing, vitest, jest, unit-testing, mocking, TDD, BDD, playwright, code-coverage]
created: 2025-01-15
---

# Testing JavaScript

> [!info] **Big Picture**
> Testing ensures your code works correctly and continues to work when changed. JavaScript testing spans **unit tests** (individual functions), **integration tests** (modules working together), and **end-to-end tests** (full user flows). **Vitest** is the recommended framework for new projects in 2025, while **Jest** remains widely used.

---

## Testing Pyramid

```
          ┌──────┐
         /  E2E   \       Few — Slow, expensive, high confidence
        /──────────\
       / Integration \    Some — Medium speed and scope
      /──────────────\
     /   Unit Tests    \   Many — Fast, cheap, focused
    /────────────────────\
```

| Level | Tests What | Speed | Confidence | Tools |
|-------|-----------|-------|------------|-------|
| **Unit** | Single function/module | Fast | Low (isolated) | Vitest, Jest |
| **Integration** | Modules working together | Medium | Medium | Vitest, Jest |
| **E2E** | Full user workflows | Slow | High | Playwright, Cypress |

---

## TDD vs BDD

### Test-Driven Development (TDD)

1. **Red** — Write a failing test
2. **Green** — Write minimal code to pass
3. **Refactor** — Improve code, tests still pass

```js
// 1. Red — write test first
test("add returns sum of two numbers", () => {
  expect(add(2, 3)).toBe(5);
}); // FAILS — add doesn't exist yet

// 2. Green — write minimal implementation
function add(a, b) { return a + b; }
// Test passes!

// 3. Refactor (if needed)
```

### Behavior-Driven Development (BDD)

Describe behavior in natural language using `describe`/`it`/`expect`.

```js
describe("ShoppingCart", () => {
  it("should start empty", () => {
    const cart = new ShoppingCart();
    expect(cart.items).toHaveLength(0);
  });

  it("should add items correctly", () => {
    const cart = new ShoppingCart();
    cart.add({ name: "Widget", price: 9.99 });
    expect(cart.items).toHaveLength(1);
    expect(cart.total).toBe(9.99);
  });
});
```

---

## Vitest (Recommended for 2025)

Built on Vite — 10–20x faster than Jest in watch mode, native ESM and TypeScript support.

### Setup

```bash
npm install -D vitest
```

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

```js
// vitest.config.js (optional — Vitest uses vite.config by default)
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,        // no need to import describe/test/expect
    environment: "node",  // or "jsdom" for DOM testing
    coverage: {
      provider: "v8"      // or "istanbul"
    }
  }
});
```

### Writing Tests

```js
// math.js
export function add(a, b) { return a + b; }
export function divide(a, b) {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}
```

```js
// math.test.js
import { describe, it, expect } from "vitest";
import { add, divide } from "./math.js";

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("handles negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("handles zero", () => {
    expect(add(0, 5)).toBe(5);
  });
});

describe("divide", () => {
  it("divides two numbers", () => {
    expect(divide(10, 2)).toBe(5);
  });

  it("throws on division by zero", () => {
    expect(() => divide(10, 0)).toThrow("Division by zero");
  });

  it("returns float for non-even division", () => {
    expect(divide(7, 2)).toBeCloseTo(3.5);
  });
});
```

---

## Common Matchers

```js
// Equality
expect(value).toBe(5);            // strict equality (===)
expect(obj).toEqual({ a: 1 });     // deep equality
expect(obj).toStrictEqual({ a: 1 }); // deep + same types

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(0.1 + 0.2).toBeCloseTo(0.3); // floating point

// Strings
expect(str).toMatch(/regex/);
expect(str).toContain("substring");
expect(str).toHaveLength(5);

// Arrays
expect(arr).toContain(item);
expect(arr).toContainEqual({ name: "Alice" }); // deep match
expect(arr).toHaveLength(3);

// Objects
expect(obj).toHaveProperty("key");
expect(obj).toHaveProperty("key", "value");
expect(obj).toMatchObject({ name: "Alice" }); // partial match

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow("message");
expect(() => fn()).toThrow(TypeError);

// Negation
expect(value).not.toBe(5);
expect(arr).not.toContain(item);
```

---

## Setup and Teardown

```js
describe("Database tests", () => {
  let db;

  beforeAll(async () => {
    // Runs once before all tests in this describe
    db = await connectToTestDB();
  });

  afterAll(async () => {
    // Runs once after all tests
    await db.close();
  });

  beforeEach(async () => {
    // Runs before EACH test
    await db.clear();
    await db.seed(testData);
  });

  afterEach(() => {
    // Runs after EACH test
    vi.restoreAllMocks();
  });

  it("fetches users", async () => {
    const users = await db.getUsers();
    expect(users).toHaveLength(3);
  });
});
```

---

## Mocking

### Mock Functions (`vi.fn()` / `jest.fn()`)

```js
import { vi } from "vitest";

// Create a mock function
const mockFn = vi.fn();
mockFn("hello");

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith("hello");

// Mock return values
const getId = vi.fn()
  .mockReturnValue(42)                     // always returns 42
  .mockReturnValueOnce(1)                  // first call returns 1
  .mockReturnValueOnce(2);                 // second call returns 2

getId(); // 1
getId(); // 2
getId(); // 42 (falls back to default)

// Mock implementation
const mockAdd = vi.fn((a, b) => a + b);
mockAdd(2, 3); // 5

// Mock resolved/rejected values (async)
const fetchData = vi.fn()
  .mockResolvedValue({ id: 1, name: "Alice" })
  .mockRejectedValueOnce(new Error("Network error"));
```

### Spying on Existing Functions

```js
import * as mathModule from "./math.js";

const spy = vi.spyOn(mathModule, "add");

mathModule.add(1, 2); // calls the REAL function

expect(spy).toHaveBeenCalledWith(1, 2);
expect(spy).toHaveReturnedWith(3);

// Override implementation
spy.mockImplementation((a, b) => 0);
mathModule.add(1, 2); // 0

spy.mockRestore(); // restore original
```

### Mocking Modules

```js
// Mock entire module
vi.mock("./api.js", () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: "Alice" }),
  saveUser: vi.fn().mockResolvedValue(true)
}));

import { fetchUser } from "./api.js"; // automatically mocked

test("uses mocked API", async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe("Alice");
});
```

### Mocking Timers

```js
describe("Timer tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("executes callback after delay", () => {
    const callback = vi.fn();
    setTimeout(callback, 1000);

    vi.advanceTimersByTime(999);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalled();
  });

  it("handles debounce", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced();
    debounced();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
```

---

## Testing Async Code

```js
// async/await (preferred)
it("fetches user data", async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe("Alice");
});

// .resolves / .rejects
it("resolves with data", async () => {
  await expect(fetchUser(1)).resolves.toEqual({ id: 1, name: "Alice" });
});

it("rejects with error", async () => {
  await expect(fetchUser(999)).rejects.toThrow("Not found");
});
```

---

## Snapshot Testing

Captures output and compares against stored snapshot.

```js
it("renders user card", () => {
  const html = renderUserCard({ name: "Alice", age: 30 });
  expect(html).toMatchSnapshot();
  // First run: creates __snapshots__/file.test.js.snap
  // Subsequent runs: compares against stored snapshot
});

// Inline snapshot
it("formats date", () => {
  expect(formatDate("2024-01-15")).toMatchInlineSnapshot('"January 15, 2024"');
});

// Update snapshots: vitest run --update
```

---

## Code Coverage

```bash
# Run with coverage
vitest run --coverage

# Install coverage provider
npm install -D @vitest/coverage-v8
```

```
Coverage Report:
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.2  |    72.1  |   90.0  |   85.2  |
 math.js            |  100.0  |   100.0  |  100.0  |  100.0  |
 auth.js            |   60.0  |    50.0  |   75.0  |   60.0  |
--------------------|---------|----------|---------|---------|
```

| Metric | What it Measures |
|--------|-----------------|
| **Statements** | % of statements executed |
| **Branches** | % of `if`/`else`/`switch` branches covered |
| **Functions** | % of functions called |
| **Lines** | % of code lines executed |

> [!tip] **Aim for 80%+ coverage** but don't chase 100%. High coverage with bad tests is worse than moderate coverage with good tests. Focus on testing **behavior**, not implementation details.

---

## Jest (Alternative)

Jest API is nearly identical to Vitest — switching is straightforward.

```bash
npm install -D jest
```

```js
// Uses jest.fn() instead of vi.fn()
// Uses jest.mock() instead of vi.mock()
// Uses jest.spyOn() instead of vi.spyOn()

// jest.config.js
module.exports = {
  testEnvironment: "node",
  transform: {}, // or configure Babel for ESM
};
```

| Feature | Vitest | Jest |
|---------|--------|------|
| Speed | ⚡ 10-20x faster | Slower |
| ESM Support | Native | Experimental |
| TypeScript | Native | Needs transform |
| Config | Uses `vite.config` | Separate config |
| API | `vi.*` | `jest.*` |
| Watch mode | Near-instant | Slower |
| Community | Growing fast | Established |

---

## E2E Testing with Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

```js
// tests/login.spec.js
import { test, expect } from "@playwright/test";

test("user can log in", async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  await page.fill('[name="email"]', "alice@example.com");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("h1")).toContainText("Welcome, Alice");
});

test("shows error for invalid credentials", async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  await page.fill('[name="email"]', "wrong@example.com");
  await page.fill('[name="password"]', "wrong");
  await page.click('button[type="submit"]');

  await expect(page.locator(".error")).toBeVisible();
  await expect(page.locator(".error")).toContainText("Invalid credentials");
});
```

---

## Testing Best Practices

> [!tip] **Guidelines**
> 1. **Test behavior, not implementation** — Test what a function does, not how.
> 2. **One assertion per concept** — Each test should verify one thing.
> 3. **Arrange-Act-Assert (AAA)** — Setup → Execute → Verify.
> 4. **Descriptive test names** — `"should return empty array when no users match filter"`.
> 5. **Don't test external libraries** — Trust that `Array.filter` works.
> 6. **Keep tests fast** — Slow tests get skipped. Mock expensive operations.
> 7. **Test edge cases** — Empty arrays, null values, boundary conditions.
> 8. **Avoid test interdependence** — Each test should pass in isolation.

```js
// AAA Pattern
it("calculates order total with discount", () => {
  // Arrange
  const order = {
    items: [
      { price: 100, qty: 2 },
      { price: 50, qty: 1 }
    ],
    discount: 0.1
  };

  // Act
  const total = calculateTotal(order);

  // Assert
  expect(total).toBe(225); // (200 + 50) * 0.9
});
```

---

## Related Topics

- [[05 - Error Handling]] — Testing error paths
- [[04 - Async Await]] — Testing async code
- [[02 - ES Modules]] — Module mocking
- [[02 - Design Patterns in JavaScript]] — Strategy pattern for test doubles

---

**Navigation:**
← [[03 - Functional Programming]] | [[05 - Memory Management and Performance]] →
