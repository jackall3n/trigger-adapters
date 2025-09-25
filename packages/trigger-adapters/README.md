# trigger-adapters

Framework adapters for [Trigger.dev](https://trigger.dev) - easily integrate background jobs into your favorite web frameworks.

## Installation

```bash
npm install trigger-adapters
# or
bun add trigger-adapters
# or
yarn add trigger-adapters
```

## Quick Start

### Next.js (App Router)

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from "trigger-adapters/nextjs";

export const { POST } = handler();
```

### Next.js (Pages Router)

```typescript
// pages/api/trigger/[id].ts
import { handler } from "trigger-adapters/nextjs";

export default handler().handle;
```

### Hono

```typescript
import { Hono } from "hono";
import { handler } from "trigger-adapters/hono";

const app = new Hono();
app.post("/trigger/:id", handler());
```

### Express

```typescript
import express from "express";
import { handler } from "trigger-adapters/express";

const app = express();
app.post("/trigger/:id", handler());
```

### Fastify

```typescript
import fastify from "fastify";
import { handler } from "trigger-adapters/fastify";

const app = fastify();
app.post("/trigger/:id", handler());
```

## Features

- 🚀 **Simple Integration** - One-line setup for each framework
- 🔧 **Type Safe** - Full TypeScript support
- 📦 **Lightweight** - Minimal dependencies
- 🎯 **Framework Agnostic** - Works with all major Node.js frameworks
- ⚡ **Fast** - Optimized for performance

## Supported Frameworks

- ✅ Next.js (App Router & Pages Router)
- ✅ Hono
- ✅ Express
- ✅ Fastify
- 🚧 Elysia (Coming Soon)
- 🚧 SvelteKit (Coming Soon)

## How It Works

Each adapter:
1. Extracts the task ID from the request URL
2. Gets the request payload
3. Triggers the task using Trigger.dev SDK
4. Returns the result in the appropriate format for each framework

## Development

### Setup

```bash
bun install
```

### Testing

```bash
bun test
```

### Building

```bash
bun run build
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [Documentation](https://trigger-adapters.vercel.app)
- [GitHub Repository](https://github.com/jackall3n/trigger-adapters)
- [Trigger.dev](https://trigger.dev)