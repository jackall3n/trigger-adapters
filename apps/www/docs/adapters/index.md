---
outline: deep
---

# Adapters Overview

Trigger Adapters provides framework-specific handlers that seamlessly integrate with your favorite web frameworks. Each adapter is optimized for its specific framework while maintaining a consistent API.

## Available Adapters

### Full-Stack Frameworks

<div class="adapter-grid">

#### [Next.js](/adapters/nextjs)
The React framework for production with built-in API routes support. Works with both App Router and Pages Router.

```typescript
import { handler } from 'trigger-adapters/nextjs';
export const POST = handler();
```

#### [SvelteKit](/adapters/sveltekit)
The official application framework for Svelte with full-stack capabilities and multiple deployment targets.

```typescript
import { handler } from 'trigger-adapters/sveltekit';
export const POST = handler();
```

</div>

### Edge & Performance Frameworks

<div class="adapter-grid">

#### [Hono](/adapters/hono)
Ultra-fast web framework for the Edge. Works on Cloudflare Workers, Deno, Bun, and Node.js.

```typescript
import { handler } from 'trigger-adapters/hono';
app.post('/trigger/:id', handler());
```

#### [Elysia](/adapters/elysia)
Bun-first framework with end-to-end type safety and outstanding developer experience.

```typescript
import { handler } from 'trigger-adapters/elysia';
app.post('/trigger/:id', handler());
```

</div>

### Node.js Frameworks

<div class="adapter-grid">

#### [Fastify](/adapters/fastify)
Fast and low overhead web framework with excellent plugin ecosystem.

```typescript
import { handler } from 'trigger-adapters/fastify';
fastify.post('/trigger/:id', handler());
```

#### [Express](/adapters/express)
The most popular Node.js web framework with extensive middleware support.

```javascript
import { handler } from 'trigger-adapters/express';
app.post('/trigger/:id', handler());
```

</div>

## Choosing an Adapter

Consider these factors when selecting an adapter:

### Use Next.js if you:
- Are building a React application
- Need server-side rendering (SSR)
- Want seamless Vercel deployment
- Prefer file-based routing

### Use SvelteKit if you:
- Are building with Svelte
- Want a lightweight, fast framework
- Need multiple deployment targets
- Prefer compile-time optimizations

### Use Hono if you:
- Need edge deployment (Cloudflare Workers)
- Want minimal overhead
- Are building microservices
- Need cross-runtime compatibility

### Use Elysia if you:
- Are using Bun runtime
- Want end-to-end type safety
- Need maximum performance
- Prefer modern DX with autocomplete

### Use Fastify if you:
- Need high performance on Node.js
- Want schema-based validation
- Use plugin architecture
- Need enterprise features

### Use Express if you:
- Have an existing Express app
- Need extensive middleware ecosystem
- Want community support
- Prefer battle-tested solutions

## Common Features

All adapters provide:

 **Simple Integration** - One-line handler setup
 **TypeScript Support** - Full type inference
 **Error Handling** - Automatic error responses
 **Consistent API** - Same pattern across frameworks
 **Payload Parsing** - Automatic JSON parsing
 **Task ID Extraction** - From route parameters

## Installation

Install the trigger-adapters package:

::: code-group

```bash [npm]
npm install trigger-adapters
```

```bash [yarn]
yarn add trigger-adapters
```

```bash [pnpm]
pnpm add trigger-adapters
```

```bash [bun]
bun add trigger-adapters
```

:::

Then import the adapter for your framework:

```typescript
// Choose your framework's adapter
import { handler } from 'trigger-adapters/nextjs';
import { handler } from 'trigger-adapters/sveltekit';
import { handler } from 'trigger-adapters/hono';
import { handler } from 'trigger-adapters/elysia';
import { handler } from 'trigger-adapters/fastify';
import { handler } from 'trigger-adapters/express';
```

## Basic Pattern

All adapters follow the same basic pattern:

1. **Create a route** with a dynamic `:id` parameter
2. **Import the handler** for your framework
3. **Export/use the handler** in your route

The handler will:
- Extract the task ID from the route parameter
- Parse the request body as JSON
- Call `tasks.trigger()` from Trigger.dev
- Return the result in the appropriate format

## Example Usage

Here's how the same task trigger looks across different frameworks:

::: code-group

```typescript [Next.js]
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';

export const POST = handler();
```

```typescript [SvelteKit]
// src/routes/api/trigger/[id]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';

export const POST = handler();
```

```typescript [Hono]
// src/index.ts
import { Hono } from 'hono';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();
app.post('/api/trigger/:id', handler());
```

```typescript [Elysia]
// src/index.ts
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const app = new Elysia()
  .post('/api/trigger/:id', handler());
```

```typescript [Fastify]
// src/index.ts
import Fastify from 'fastify';
import { handler } from 'trigger-adapters/fastify';

const fastify = Fastify();
fastify.post('/api/trigger/:id', handler());
```

```javascript [Express]
// src/index.js
import express from 'express';
import { handler } from 'trigger-adapters/express';

const app = express();
app.use(express.json());
app.post('/api/trigger/:id', handler());
```

:::

## Advanced Usage

All adapters support:

- **Authentication** - Add auth middleware before the handler
- **Validation** - Validate payloads before triggering
- **Error Handling** - Wrap handlers for custom errors
- **Rate Limiting** - Add rate limit middleware
- **Logging** - Add request/response logging
- **CORS** - Configure cross-origin requests

See each adapter's documentation for framework-specific examples.

## Contributing

Want to add support for another framework? Check our [GitHub repository](https://github.com/jackall3n/trigger-adapters) for contribution guidelines.

## Next Steps

1. Choose your framework's adapter from the list above
2. Follow the adapter-specific documentation
3. Check the [Usage Guide](/guide/usage) for common patterns
4. Read about [Trigger.dev](https://trigger.dev/docs) concepts

<style>
.adapter-grid {
  margin: 1.5rem 0;
}

.adapter-grid h4 {
  margin-top: 1.5rem;
}

.adapter-grid p {
  color: var(--vp-c-text-2);
  margin: 0.5rem 0;
}

.adapter-grid pre {
  margin-top: 0.5rem;
}
</style>