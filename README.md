# trigger-adapters

Framework-agnostic HTTP handlers for [Trigger.dev](https://trigger.dev) – expose your background tasks via REST endpoints in any web framework.

[![npm version](https://badge.fury.io/js/trigger-adapters.svg)](https://www.npmjs.com/package/trigger-adapters)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Simple Integration** - Drop-in handlers for your existing web framework
- 🎯 **Framework Support** - Pre-built adapters for Next.js, Hono, and Express
- 📦 **Lightweight** - Minimal dependencies, tiny bundle size
- 🛠️ **TypeScript First** - Full type safety and autocompletion
- 🔄 **Consistent API** - Same pattern across all frameworks

## Installation

```bash
npm install trigger-adapters
```

Or using your preferred package manager:

```bash
yarn add trigger-adapters
pnpm add trigger-adapters
bun add trigger-adapters
```

## Quick Start

### Next.js (App Router)

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';

export const POST = handler();
```

### Hono

```typescript
import { Hono } from 'hono';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

app.post('/api/trigger/:id', handler());

export default app;
```

### Express

```javascript
import express from 'express';
import { handler } from 'trigger-adapters/express';

const app = express();

app.use(express.json());
app.post('/api/trigger/:id', handler());

app.listen(3000);
```

## How It Works

Trigger Adapters provides a simple, consistent interface for exposing Trigger.dev tasks via HTTP endpoints:

1. **Extract Task ID** from the route parameters
2. **Parse Request Body** to get the task payload
3. **Trigger the Task** using Trigger.dev SDK
4. **Return Response** in the appropriate format for the framework

Each adapter handles framework-specific details like request/response formats, middleware integration, and error handling.

## Documentation

Visit [https://trigger-adapters.dev](https://trigger-adapters.dev) for full documentation, including:

- [Getting Started Guide](https://trigger-adapters.dev/guide/introduction)
- [Usage Examples](https://trigger-adapters.dev/guide/usage)
- [Next.js Adapter](https://trigger-adapters.dev/adapters/nextjs)
- [Hono Adapter](https://trigger-adapters.dev/adapters/hono)
- [Express Adapter](https://trigger-adapters.dev/adapters/express)

## Examples

### With Authentication (Next.js)

```typescript
import { handler } from 'trigger-adapters/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const token = request.headers.get('Authorization');

  if (!token || !await verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return handler()(request, context);
}
```

### With Middleware (Hono)

```typescript
import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { cors } from 'hono/cors';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

app.use('/api/*', cors());
app.use('/api/trigger/*', bearerAuth({ token: process.env.API_TOKEN }));

app.post('/api/trigger/:id', handler());
```

### With Rate Limiting (Express)

```javascript
import express from 'express';
import rateLimit from 'express-rate-limit';
import { handler } from 'trigger-adapters/express';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(express.json());
app.post('/api/trigger/:id', limiter, handler());
```

## Development

This is a monorepo managed with [Turborepo](https://turborepo.com) and [Bun](https://bun.sh).

### Project Structure

```
trigger-adapters/
├── packages/
│   └── trigger-adapters/    # Main library package
├── apps/
│   └── www/                 # Documentation site (VitePress)
└── README.md
```

### Getting Started

```bash
# Clone the repository
git clone https://github.com/jackall3n/trigger-adapters.git
cd trigger-adapters

# Install dependencies
bun install

# Build all packages
bun run build

# Run development mode
bun run dev

# Run tests
cd packages/trigger-adapters
bun run test
```

### Commands

| Command | Description |
|---------|-------------|
| `bun run build` | Build all packages |
| `bun run dev` | Start development mode |
| `bun run check` | Run Biome linter/formatter check |
| `bun run check:write` | Fix linting/formatting issues |
| `bun run check-types` | Run TypeScript type checking |

### Package Development

The main library is in `packages/trigger-adapters/`:

```bash
cd packages/trigger-adapters

# Build the library
bun run build

# Watch mode for development
bun run dev

# Run tests
bun run test

# Type checking
bun run typecheck

# Release new version
bun run release
```

### Documentation Development

The documentation site is in `apps/www/`:

```bash
cd apps/www

# Start dev server
bun run dev

# Build documentation
bun run build

# Preview built docs
bun run preview
```

## API Reference

### `handler()`

All adapters export a `handler()` function that returns a framework-specific request handler.

#### Next.js

```typescript
import { handler } from 'trigger-adapters/nextjs';

// App Router
export const POST = handler();

// Pages Router
export default handler();
```

#### Hono

```typescript
import { handler } from 'trigger-adapters/hono';

app.post('/trigger/:id', handler());
```

#### Express

```javascript
import { handler } from 'trigger-adapters/express';

app.post('/trigger/:id', handler());
```

## Prerequisites

- [Trigger.dev](https://trigger.dev) account and SDK configured
- One of the supported frameworks (Next.js, Hono, Express)
- Node.js 18+ or Bun

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use Bun as the package manager
- Follow the existing code style (enforced by Biome)
- Add tests for new features
- Update documentation as needed

## Support

- 📚 [Documentation](https://trigger-adapters.dev)
- 💬 [GitHub Issues](https://github.com/jackall3n/trigger-adapters/issues)
- 🐛 [Bug Reports](https://github.com/jackall3n/trigger-adapters/issues/new?labels=bug)
- 💡 [Feature Requests](https://github.com/jackall3n/trigger-adapters/issues/new?labels=enhancement)

## License

MIT © [Jack Allen](https://github.com/jackall3n)

## Acknowledgments

- Built for [Trigger.dev](https://trigger.dev)
- Inspired by the need for simple, consistent HTTP handlers across frameworks
- Thanks to all contributors and users

---

Made with ❤️ by [Jack Allen](https://github.com/jackall3n)