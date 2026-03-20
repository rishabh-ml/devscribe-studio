---
title: Node.js Fundamentals
phase: 10
topic: Node.js Fundamentals
tags: [javascript, nodejs, npm, fs, path, http, events, streams, package-json, modules]
created: 2025-01-15
---

# Node.js Fundamentals

> [!info] **Big Picture**
> Node.js is a JavaScript runtime built on Chrome's V8 engine, enabling JavaScript on the server. **Node.js 24** is the current version; **Node.js 22** is in active LTS. Key features: built-in modules for file system, networking, streams; npm for package management; native TypeScript support (since Node 22.18.0); a built-in test runner; and a Permission Model for sandboxing.

---

## Running Node.js

```bash
# Run a JavaScript file
node app.js

# Run a TypeScript file (Node 22.18+)
node app.ts

# REPL (interactive)
node

# Evaluate inline code
node -e "console.log(1 + 2)"

# Watch mode (auto-restart on file changes)
node --watch app.js
```

---

## Built-In Modules

### `fs` — File System

```js
import { readFileSync, writeFileSync } from "node:fs";
import { readFile, writeFile, mkdir, readdir, stat, rm } from "node:fs/promises";

// Synchronous (blocks the event loop — avoid in servers)
const data = readFileSync("file.txt", "utf-8");
writeFileSync("output.txt", "Hello World");

// Asynchronous (preferred)
const content = await readFile("file.txt", "utf-8");
await writeFile("output.txt", "Hello World");

// Directory operations
await mkdir("new-dir", { recursive: true });
const files = await readdir("./src");
const info = await stat("file.txt");
console.log(info.isFile(), info.size);

// Delete
await rm("temp", { recursive: true, force: true });
```

### `path` — Path Utilities

```js
import path from "node:path";

path.join("src", "utils", "helpers.js");    // "src/utils/helpers.js"
path.resolve("src", "utils");               // "/absolute/path/to/src/utils"
path.basename("/path/to/file.txt");         // "file.txt"
path.basename("/path/to/file.txt", ".txt"); // "file"
path.dirname("/path/to/file.txt");          // "/path/to"
path.extname("file.txt");                   // ".txt"
path.parse("/path/to/file.txt");
// { root: "/", dir: "/path/to", base: "file.txt", ext: ".txt", name: "file" }
```

### `http` — Creating Servers

```js
import http from "node:http";

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === "GET" && url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World!");
  } else if (method === "GET" && url === "/api/users") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([{ id: 1, name: "Alice" }]));
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```

### `events` — EventEmitter

```js
import { EventEmitter } from "node:events";

class TaskQueue extends EventEmitter {
  #tasks = [];

  add(task) {
    this.#tasks.push(task);
    this.emit("taskAdded", task);
  }

  async process() {
    while (this.#tasks.length) {
      const task = this.#tasks.shift();
      this.emit("taskStart", task);
      await task.execute();
      this.emit("taskComplete", task);
    }
  }
}

const queue = new TaskQueue();
queue.on("taskAdded", task => console.log(`Task added: ${task.name}`));
queue.on("taskComplete", task => console.log(`Task done: ${task.name}`));
```

### `stream` — Streams

Process large data incrementally without loading everything into memory.

```js
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { Transform } from "node:stream";

// Read + Transform + Write using pipeline
const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  }
});

await pipeline(
  createReadStream("input.txt"),
  upperCase,
  createWriteStream("output.txt")
);

// Compress a file
await pipeline(
  createReadStream("large-file.txt"),
  createGzip(),
  createWriteStream("large-file.txt.gz")
);
```

| Stream Type | Description | Example |
|-------------|-------------|---------|
| **Readable** | Source of data | `fs.createReadStream`, `http req` |
| **Writable** | Destination for data | `fs.createWriteStream`, `http res` |
| **Transform** | Modify data in transit | `zlib.createGzip`, custom transforms |
| **Duplex** | Both readable and writable | `net.Socket`, `WebSocket` |

### `url` and `URLSearchParams`

```js
const url = new URL("https://example.com/path?q=hello&page=2");
url.hostname;    // "example.com"
url.pathname;    // "/path"
url.searchParams.get("q");     // "hello"
url.searchParams.set("page", "3");
url.toString();  // "https://example.com/path?q=hello&page=3"
```

### `crypto` — Hashing and Encryption

```js
import { createHash, randomUUID, randomBytes } from "node:crypto";

// Hash
const hash = createHash("sha256").update("password").digest("hex");

// UUID
const id = randomUUID(); // "550e8400-e29b-41d4-a716-446655440000"

// Random bytes
const token = randomBytes(32).toString("hex");
```

### `child_process` — Running System Commands

```js
import { exec, spawn } from "node:child_process";
import { execSync } from "node:child_process";

// exec — run command, get full output
exec("ls -la", (error, stdout, stderr) => {
  console.log(stdout);
});

// spawn — streaming output (better for large output)
const child = spawn("node", ["script.js"]);
child.stdout.on("data", data => console.log(`stdout: ${data}`));
child.stderr.on("data", data => console.error(`stderr: ${data}`));
child.on("close", code => console.log(`Exit code: ${code}`));

// Synchronous (blocks — use in scripts, not servers)
const result = execSync("echo hello").toString();
```

### `os` — System Information

```js
import os from "node:os";

os.platform();  // "linux", "darwin", "win32"
os.arch();      // "x64", "arm64"
os.cpus();      // CPU info
os.totalmem();  // total memory in bytes
os.freemem();   // free memory
os.homedir();   // home directory
os.tmpdir();    // temp directory
```

---

## Environment Variables

```js
// Access
process.env.NODE_ENV;    // "production" | "development"
process.env.PORT;        // "3000" (always strings!)
process.env.API_KEY;

// Node 20+ built-in env file support
// node --env-file=.env app.js

// .env file
// PORT=3000
// API_KEY=secret123

// Or use dotenv package
import "dotenv/config";
```

---

## `process` Object

```js
process.argv;        // command line arguments
process.cwd();       // current working directory
process.exit(0);     // exit with code 0 (success)
process.exit(1);     // exit with code 1 (error)
process.pid;         // process ID
process.version;     // Node.js version

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down...");
  server.close(() => process.exit(0));
});

// Uncaught errors
process.on("uncaughtException", err => {
  console.error("Uncaught:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
});
```

---

## npm and `package.json`

### `package.json` Anatomy

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "My awesome project",
  "main": "index.js",           // CJS entry point
  "module": "index.mjs",        // ESM entry point
  "exports": {                  // Modern entry points (preferred)
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "type": "module",             // treat .js as ESM
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "vitest",
    "build": "tsc"
  },
  "dependencies": {             // production
    "express": "^4.18.2"
  },
  "devDependencies": {          // development only
    "vitest": "^2.0.0",
    "typescript": "^5.6.0"
  },
  "peerDependencies": {         // expected in host project
    "react": "^18.0.0"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

### Semantic Versioning

```
MAJOR.MINOR.PATCH
  2  .  1  .  3

^2.1.3 → ≥2.1.3, <3.0.0 (compatible updates)
~2.1.3 → ≥2.1.3, <2.2.0 (patch updates only)
2.1.3  → exactly 2.1.3
*      → any version
```

### Common npm Commands

```bash
npm init -y              # create package.json
npm install express      # add dependency
npm install -D vitest    # add dev dependency
npm uninstall lodash     # remove package
npm update               # update packages
npm outdated             # check for outdated packages
npm audit                # security audit
npm run build            # run script
npx create-vite my-app   # run package without installing
npm ls                   # list installed packages
```

### `package-lock.json`

- Locks exact versions of all dependencies (including transitive)
- Always commit to version control
- Ensures everyone gets the same dependency tree
- `npm ci` — clean install from lockfile (faster, deterministic)

---

## Native TypeScript Support

```bash
# Node 22.18+ — run .ts files directly (unflagged)
node app.ts

# Strips type annotations at runtime (type erasure)
# No type checking — use tsc for that
tsc --noEmit          # type-check only
node app.ts           # run with type stripping
```

---

## Built-In Test Runner

```js
// math.test.js
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { add } from "./math.js";

describe("add", () => {
  test("adds two numbers", () => {
    assert.strictEqual(add(2, 3), 5);
  });

  test("handles negatives", () => {
    assert.strictEqual(add(-1, -2), -3);
  });
});
```

```bash
node --test                    # run all test files
node --test --watch            # watch mode
node --test --experimental-test-coverage  # coverage
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`process.env` values are always strings** — `process.env.PORT` is `"3000"`, not `3000`. Parse with `Number()`.
> 2. **Don't use `readFileSync` in server request handlers** — It blocks the entire event loop. Use `readFile` (async).
> 3. **`__dirname`/`__filename` don't exist in ESM** — Use `import.meta.url` and `fileURLToPath()` instead.
> 4. **`require` and `import` can't be mixed freely** — Stick with one module system. Use `"type": "module"` in package.json for ESM.
> 5. **Always handle stream errors** — Use `pipeline()` instead of `.pipe()` for proper error propagation.

```js
// ESM replacement for __dirname
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

---

## Related Topics

- [[02 - ES Modules]] — ESM in Node.js
- [[02 - The Event Loop]] — Node.js event loop phases
- [[04 - Async Await]] — Async patterns in Node
- [[04 - Build Tools and Modern Ecosystem]] — npm, pnpm, Bun
- [[02 - TypeScript Fundamentals]] — Using TypeScript with Node

---

**Navigation:**
← [[02 - TypeScript Fundamentals]] | [[04 - Build Tools and Modern Ecosystem]] →
