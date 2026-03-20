---
title: TypeScript Fundamentals
phase: 10
topic: TypeScript Fundamentals
tags: [javascript, typescript, types, interfaces, generics, type-guards, utility-types, strict-mode]
created: 2025-01-15
---

# TypeScript Fundamentals

> [!info] **Big Picture**
> TypeScript adds **static types** to JavaScript — code is type-checked at compile time, then types are stripped to produce plain JavaScript. Over **90% of JavaScript developers** use TypeScript. It catches bugs before runtime, improves IDE support (autocomplete, refactoring), and serves as living documentation. TypeScript 5.x is current; **TypeScript 7.0 (Project Corsa)** — a complete rewrite in Go — promises ~10x faster builds (expected early 2026).

---

## Basic Types

```ts
// Primitives
let name: string = "Alice";
let age: number = 30;
let active: boolean = true;
let big: bigint = 100n;
let id: symbol = Symbol("id");

// Special types
let anything: any = "hello";    // opt-out of type checking (avoid!)
let unknown: unknown = "hello"; // type-safe any — must narrow before use
let nothing: void = undefined;  // functions that return nothing
let never: never;               // impossible values (always throws, infinite loop)
let empty: null = null;
let missing: undefined = undefined;

// Arrays
let nums: number[] = [1, 2, 3];
let strs: Array<string> = ["a", "b"]; // generic syntax

// Tuple — fixed-length array with specific types per position
let pair: [string, number] = ["Alice", 30];

// Object type
let user: { name: string; age: number; email?: string } = {
  name: "Alice",
  age: 30
  // email is optional (?)
};
```

---

## Type Inference

TypeScript infers types where possible — you don't annotate everything.

```ts
let x = 10;          // inferred as number
let s = "hello";     // inferred as string
let arr = [1, 2, 3]; // inferred as number[]

// Function return type inferred
function add(a: number, b: number) {
  return a + b; // return type inferred as number
}

// const inference — literal types
const PORT = 3000;       // type is 3000, not number
const MODE = "production"; // type is "production", not string

// as const — deeply readonly + literal types
const config = {
  host: "localhost",
  port: 3000,
  tags: ["a", "b"]
} as const;
// type: { readonly host: "localhost"; readonly port: 3000; readonly tags: readonly ["a", "b"] }
```

---

## Interfaces

Define the shape of objects. Can be extended and merged.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;          // optional
  readonly createdAt: Date; // cannot be modified after creation
}

// Usage
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date()
};

// Extending interfaces
interface Admin extends User {
  permissions: string[];
  level: number;
}

// Interface merging (declaration merging)
interface User {
  lastLogin?: Date; // merges with the original User interface
}

// Method signatures
interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
}
```

---

## Type Aliases

Create named types. More flexible than interfaces — work with unions, intersections, primitives.

```ts
// Object types (similar to interface)
type User = {
  id: number;
  name: string;
  email: string;
};

// Primitive aliases
type ID = string | number;
type Status = "active" | "inactive" | "pending";

// Function types
type Callback = (data: string) => void;
type AsyncFn = () => Promise<void>;

// Tuple types
type Coordinate = [number, number];
type NameAge = [string, number];
```

### Interface vs Type Alias

| Feature | `interface` | `type` |
|---------|-----------|--------|
| Object shapes | ✅ | ✅ |
| Extends/inheritance | `extends` | `&` (intersection) |
| Declaration merging | ✅ | ❌ |
| Union types | ❌ | ✅ `string \| number` |
| Primitive aliases | ❌ | ✅ `type ID = string` |
| Mapped types | ❌ | ✅ |
| Classes can implement | ✅ | ✅ |

> [!tip] **Rule of Thumb**: Use `interface` for objects/classes. Use `type` for unions, intersections, primitives, and complex types.

---

## Union and Intersection Types

```ts
// Union — value is ONE of these types
type StringOrNumber = string | number;
let id: StringOrNumber = "abc";
id = 123; // also valid

// Discriminated Union (tagged union)
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
  }
}

// Intersection — value has ALL properties
type WithId = { id: number };
type WithName = { name: string };
type IdentifiedUser = WithId & WithName;
// { id: number; name: string; }
```

---

## Generics

Write reusable, type-safe code that works with any type.

```ts
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

identity<string>("hello"); // explicit
identity(42);              // inferred as number

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "Alice", email: "a@b.com" },
  status: 200,
  message: "OK"
};

// Generic constraints
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello");     // 5
getLength([1, 2, 3]);   // 3
getLength({ length: 10 }); // 10
// getLength(42);       // Error: number doesn't have 'length'

// Multiple generics
function mapObject<K extends string, V, R>(
  obj: Record<K, V>,
  fn: (val: V) => R
): Record<K, R> {
  const result = {} as Record<K, R>;
  for (const key in obj) {
    result[key] = fn(obj[key]);
  }
  return result;
}
```

---

## Type Guards

Narrow types at runtime for type-safe code.

```ts
// typeof
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase(); // TypeScript knows it's string
  }
  return value.toFixed(2); // TypeScript knows it's number
}

// instanceof
function handleError(error: Error | string) {
  if (error instanceof Error) {
    console.log(error.message); // Error
  } else {
    console.log(error); // string
  }
}

// in operator
function handleShape(shape: Circle | Rect) {
  if ("radius" in shape) {
    return Math.PI * shape.radius ** 2; // Circle
  }
  return shape.width * shape.height; // Rect
}

// Custom type predicate
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value
  );
}

if (isUser(data)) {
  console.log(data.name); // TypeScript knows it's User
}

// Discriminated union narrowing
function handleEvent(event: { type: "click"; x: number } | { type: "key"; key: string }) {
  switch (event.type) {
    case "click":
      console.log(event.x); // knows it's click event
      break;
    case "key":
      console.log(event.key); // knows it's key event
      break;
  }
}
```

---

## Utility Types

TypeScript provides built-in types for common transformations.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Partial<T> — all properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number; }

// Required<T> — all properties required
type FullUser = Required<PartialUser>;

// Readonly<T> — all properties readonly
type FrozenUser = Readonly<User>;

// Pick<T, K> — select specific properties
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string; }

// Omit<T, K> — exclude specific properties
type UserWithoutId = Omit<User, "id">;
// { name: string; email: string; age: number; }

// Record<K, V> — create object type from key/value types
type RolePermissions = Record<"admin" | "user" | "guest", string[]>;
// { admin: string[]; user: string[]; guest: string[]; }

// ReturnType<T> — extract function return type
function getUser() { return { name: "Alice", age: 30 }; }
type UserReturn = ReturnType<typeof getUser>;
// { name: string; age: number; }

// Parameters<T> — extract function parameter types
type GetUserParams = Parameters<typeof getUser>;
// []

// Awaited<T> — unwrap Promise type
type Data = Awaited<Promise<string>>; // string

// Exclude<T, U> — remove types from union
type StringOrNumber = string | number | boolean;
type NoBoolean = Exclude<StringOrNumber, boolean>; // string | number

// Extract<T, U> — keep only matching types
type OnlyStrings = Extract<string | number | boolean, string>; // string

// NonNullable<T> — remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string
```

---

## Enums

```ts
// Numeric enum
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

// String enum (preferred — more readable in debugging)
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}

// Usage
let dir: Direction = Direction.Up;
let status: Status = Status.Active;

// Alternative: const enum (inlined at compile time)
const enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE"
}
// Color.Red compiles to just "RED" (no enum object at runtime)

// Alternative: union type (often preferred over enum)
type Status = "active" | "inactive" | "pending";
```

> [!tip] Many TypeScript developers prefer **union types** (`"active" | "inactive"`) over enums because they're simpler, have no runtime overhead, and work better with tree shaking.

---

## Strict Mode

Always enable strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

`strict: true` enables all strict checks:
- `strictNullChecks` — `null`/`undefined` must be handled explicitly
- `noImplicitAny` — must specify types when not inferrable
- `strictFunctionTypes` — proper function parameter type checking
- `strictPropertyInitialization` — class properties must be initialized
- `alwaysStrict` — emits `"use strict"` in JS output

---

## Declaration Files (`.d.ts`)

Provide types for JavaScript libraries:

```ts
// custom-lib.d.ts
declare module "custom-lib" {
  export function doSomething(input: string): number;
  export interface Config {
    debug: boolean;
    timeout: number;
  }
}

// Types for global variables
declare const API_URL: string;
declare function gtag(event: string, data: object): void;
```

Most libraries ship with types or have `@types/*` packages:
```bash
npm install @types/lodash  # types for lodash
```

---

## Common Patterns

### Generics with React (Common Use Case)

```ts
// Generic component prop
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return items.map(item => (
    <div key={keyExtractor(item)}>{renderItem(item)}</div>
  ));
}
```

### Type-Safe API Client

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestConfig<T> {
  method: HttpMethod;
  url: string;
  body?: T;
  headers?: Record<string, string>;
}

async function request<TBody, TResponse>(
  config: RequestConfig<TBody>
): Promise<TResponse> {
  const res = await fetch(config.url, {
    method: config.method,
    headers: config.headers,
    body: config.body ? JSON.stringify(config.body) : undefined
  });
  return res.json() as Promise<TResponse>;
}

// Usage — fully typed
const user = await request<never, User>({
  method: "GET",
  url: "/api/users/1"
});
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`any` defeats the purpose** — Use `unknown` instead and narrow the type.
> 2. **Types are erased at runtime** — You can't do `if (x instanceof MyType)` with type aliases. Use discriminated unions or type guards.
> 3. **Enums have runtime overhead** — They create JavaScript objects. Consider union types or `as const` instead.
> 4. **`strictNullChecks` matters** — Without it, `null` and `undefined` are assignable to everything, hiding bugs.
> 5. **Excessive type assertions (`as`)** — If you're casting everywhere, your types are wrong. Fix the types.
> 6. **`object` vs `Object` vs `{}`** — `object` = non-primitive, `Object` = anything (avoid), `{}` = any non-null (avoid). Use specific types.

---

## 🎯 Practice Exercises

1. **Type a Function** — Write a generic `pipe()` function that composes two functions: `pipe(f: (a: A) => B, g: (b: B) => C): (a: A) => C`. Test with string → number → boolean.
2. **API Response Types** — Define types for a REST API: `ApiResponse<T>` with `{ data: T; error: string | null; status: number }`. Create specific types for `User`, `Post`, and `Comment` responses.
3. **Discriminated Union** — Model a `Shape` type (circle, rectangle, triangle) using discriminated unions. Write an `area()` function with exhaustive switch that TypeScript verifies.
4. **Type Guard** — Write a custom type guard `isString(value: unknown): value is string`. Then write `isArray<T>(value: unknown): value is T[]`. Use them to safely narrow types.
5. **Utility Types** — Given an interface `User { id: number; name: string; email: string; role: string }`, create: `Partial<User>`, `Pick<User, 'id' | 'name'>`, `Omit<User, 'role'>`, `Readonly<User>`, and a custom `RequireOnly<T, K>` that makes only specified keys required.

---

## Related Topics

- [[02 - ES Modules]] — TypeScript uses ESM imports/exports
- [[05 - ES6 Classes]] — TypeScript class features extend ES6 classes
- [[03 - Node.js Fundamentals]] — Node.js natively runs TypeScript (22.18+)
- [[04 - Build Tools and Modern Ecosystem]] — TypeScript compilation in build pipelines

---

**Navigation:**
← [[01 - Phase 10 - Overview]] | [[03 - Node.js Fundamentals]] →
