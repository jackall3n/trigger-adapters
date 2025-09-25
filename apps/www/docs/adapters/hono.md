---
outline: deep
---

# Hono Adapter

The Hono adapter provides seamless integration with [Hono](https://hono.dev/), the ultra-fast web framework for the Edge.

## Installation

::: code-group

```bash [npm]
npm install trigger-adapters hono
```

```bash [yarn]
yarn add trigger-adapters hono
```

```bash [pnpm]
pnpm add trigger-adapters hono
```

```bash [bun]
bun add trigger-adapters hono
```

:::

## Basic Usage

```typescript
import { Hono } from 'hono';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

// Add the trigger endpoint
app.post('/api/trigger/:id', handler());

export default app;
```

## Platform Examples

Hono works across multiple platforms. Here are examples for the most common ones:

### Cloudflare Workers

```typescript
// src/index.ts
import { Hono } from 'hono';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

app.post('/api/trigger/:id', handler());

export default app;
```

```toml
# wrangler.toml
name = "my-trigger-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"
```

### Bun

```typescript
import { Hono } from 'hono';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

app.post('/api/trigger/:id', handler());

export default {
  port: 3000,
  fetch: app.fetch,
};
```

### Deno

```typescript
import { Hono } from 'https://deno.land/x/hono/mod.ts';
import { handler } from 'npm:trigger-adapters/hono';

const app = new Hono();

app.post('/api/trigger/:id', handler());

Deno.serve({ port: 3000 }, app.fetch);
```

### Node.js

```typescript
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

app.post('/api/trigger/:id', handler());

serve({
  fetch: app.fetch,
  port: 3000,
});
```

## Middleware Integration

Hono's middleware system works seamlessly with the adapter:

### Authentication

```typescript
import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

// Add authentication
app.use('/api/trigger/*', bearerAuth({ token: process.env.API_TOKEN }));

app.post('/api/trigger/:id', handler());
```

### CORS

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

// Enable CORS
app.use('/api/*', cors());

app.post('/api/trigger/:id', handler());
```

### Rate Limiting

```typescript
import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

// Add rate limiting
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-6',
  keyGenerator: (c) => c.req.header('x-real-ip') ?? '',
});

app.use('/api/trigger/*', limiter);

app.post('/api/trigger/:id', handler());
```

## Advanced Usage

### Custom Context

Access Hono's context within a wrapper:

```typescript
import { Hono } from 'hono';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

app.post('/api/trigger/:id', async (c) => {
  // Access request headers
  const userAgent = c.req.header('User-Agent');

  // Log the trigger
  console.log(`Task triggered by: ${userAgent}`);

  // Call the handler
  return handler()(c);
});
```

### Environment Variables

Access environment variables in different runtimes:

```typescript
// Cloudflare Workers
app.post('/api/trigger/:id', async (c) => {
  const env = c.env;
  // Use env.TRIGGER_API_KEY
  return handler()(c);
});

// Node.js/Bun
app.post('/api/trigger/:id', async (c) => {
  const apiKey = process.env.TRIGGER_API_KEY;
  return handler()(c);
});
```

### Error Handling

Add custom error handling:

```typescript
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

// Global error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  console.error('Unexpected error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

app.post('/api/trigger/:id', handler());
```

## TypeScript Configuration

For full TypeScript support, configure your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "types": [
      "@cloudflare/workers-types" // For Cloudflare Workers
    ]
  }
}
```

## Testing

Example of testing Hono routes with the adapter:

```typescript
import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { handler } from 'trigger-adapters/hono';

describe('Trigger endpoint', () => {
  const app = new Hono();
  app.post('/api/trigger/:id', handler());

  it('should trigger a task', async () => {
    const res = await app.request('/api/trigger/my-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('id');
  });

  it('should return error for missing task ID', async () => {
    const res = await app.request('/api/trigger/', {
      method: 'POST',
    });

    expect(res.status).toBe(404);
  });
});
```

## Deployment

### Cloudflare Workers

```bash
# Deploy with Wrangler
wrangler deploy
```

### Vercel Edge Functions

```typescript
// api/trigger/[id].ts
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

app.post('/api/trigger/:id', handler());

export const config = {
  runtime: 'edge',
};

export default handle(app);
```

### AWS Lambda

```typescript
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

app.post('/api/trigger/:id', handler());

export const lambdaHandler = handle(app);
```

## Performance Considerations

The Hono adapter is optimized for performance:

- **Minimal overhead**: The adapter adds minimal processing on top of Hono's already fast routing
- **Edge-ready**: Works efficiently in edge environments with limited resources
- **Streaming support**: Handles large payloads efficiently

## Common Patterns

### API Versioning

```typescript
const app = new Hono();

// Version 1
app.post('/api/v1/trigger/:id', handler());

// Version 2 with enhanced features
app.post('/api/v2/trigger/:id', async (c) => {
  // Add v2 specific logic
  return handler()(c);
});
```

### Multi-tenant Setup

```typescript
app.post('/api/:tenant/trigger/:id', async (c) => {
  const tenant = c.req.param('tenant');

  // Validate tenant
  if (!isValidTenant(tenant)) {
    return c.json({ error: 'Invalid tenant' }, 403);
  }

  return handler()(c);
});
```

## Troubleshooting

### Common Issues

**404 Not Found**
- Check that the route pattern matches: `/api/trigger/:id`
- Ensure the HTTP method is POST

**Type Errors**
- Make sure TypeScript is configured correctly
- Install proper type definitions for your runtime

**Environment Variables**
- Different runtimes access env vars differently
- Check the platform-specific documentation

## API Reference

### `handler()`

Returns a Hono handler function that:
- Extracts task ID from `c.req.param('id')`
- Parses JSON body from the request
- Calls `tasks.trigger()` with the ID and payload
- Returns the result as JSON

```typescript
import { handler } from 'trigger-adapters/hono';

// Basic usage
app.post('/trigger/:id', handler());
```

## Next Steps

- Learn about [general usage patterns](/guide/usage)
- Explore the [Next.js adapter](/adapters/nextjs)
- Check out [Hono documentation](https://hono.dev)