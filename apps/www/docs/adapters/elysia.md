---
outline: deep
---

# Elysia Adapter

The Elysia adapter provides integration with [Elysia](https://elysiajs.com/), a Bun-first web framework with end-to-end type safety and outstanding developer experience.

## Installation

::: code-group

```bash [bun]
bun add trigger-adapters elysia
```

```bash [npm]
npm install trigger-adapters elysia
```

```bash [yarn]
yarn add trigger-adapters elysia
```

```bash [pnpm]
pnpm add trigger-adapters elysia
```

:::

## Basic Usage

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const app = new Elysia()
  .post('/api/trigger/:id', handler())
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
```

## Type-Safe Routes

Elysia provides automatic type inference:

```typescript
import { Elysia, t } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const app = new Elysia()
  .post('/api/trigger/:id', handler(), {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      email: t.String({ format: 'email' }),
      name: t.String({ minLength: 1 })
    })
  });
```

## Validation

### Schema Validation

Elysia's built-in validation using TypeBox:

```typescript
import { Elysia, t } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const TaskSchema = t.Object({
  userId: t.String(),
  action: t.Union([
    t.Literal('create'),
    t.Literal('update'),
    t.Literal('delete')
  ]),
  data: t.Record(t.String(), t.Any())
});

const app = new Elysia()
  .post('/api/trigger/:id', handler(), {
    body: TaskSchema,
    response: {
      200: t.Object({
        id: t.String(),
        status: t.String()
      }),
      400: t.Object({
        error: t.String()
      })
    }
  });
```

### Custom Validation

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const app = new Elysia()
  .onBeforeHandle(({ params, body, set }) => {
    if (params.id === 'restricted') {
      set.status = 403;
      return { error: 'This task is restricted' };
    }

    if (!isValidPayload(body)) {
      set.status = 400;
      return { error: 'Invalid payload' };
    }
  })
  .post('/api/trigger/:id', handler());
```

## Plugins & Middleware

### Authentication Plugin

```typescript
import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';
import { handler } from 'trigger-adapters/elysia';

const app = new Elysia()
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET!
  }))
  .derive(async ({ jwt, headers }) => {
    const auth = headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return { user: null };
    }

    const token = auth.slice(7);
    const payload = await jwt.verify(token);

    return {
      user: payload ? { id: payload.sub } : null
    };
  })
  .guard({
    beforeHandle({ user, set }) {
      if (!user) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }
    }
  })
  .post('/api/trigger/:id', handler());
```

### Rate Limiting

```typescript
import { Elysia } from 'elysia';
import { rateLimit } from 'elysia-rate-limit';
import { handler } from 'trigger-adapters/elysia';

const app = new Elysia()
  .use(rateLimit({
    max: 100,
    duration: 60000 // 1 minute
  }))
  .post('/api/trigger/:id', handler());
```

### CORS

```typescript
import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { handler } from 'trigger-adapters/elysia';

const app = new Elysia()
  .use(cors({
    origin: ['https://app.example.com'],
    credentials: true,
    methods: ['POST']
  }))
  .post('/api/trigger/:id', handler());
```

## Groups & Guards

### Grouped Routes

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const app = new Elysia()
  .group('/api/trigger', (app) =>
    app
      .guard({
        headers: t.Object({
          'x-api-key': t.String()
        })
      })
      .onBeforeHandle(({ headers }) => {
        if (!isValidApiKey(headers['x-api-key'])) {
          throw new Error('Invalid API key');
        }
      })
      .post('/:id', handler())
      .post('/batch', batchHandler())
  );
```

### Protected Routes

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const protectedRoutes = new Elysia()
  .derive(({ headers }) => {
    const user = authenticateUser(headers.authorization);
    if (!user) throw new Error('Unauthorized');
    return { user };
  });

const app = new Elysia()
  .use(protectedRoutes)
  .post('/api/trigger/:id', handler());
```

## Error Handling

### Global Error Handler

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const app = new Elysia()
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        error: 'Validation failed',
        details: error.message
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Task not found' };
    }

    // Log unexpected errors
    console.error(error);
    set.status = 500;
    return { error: 'Internal server error' };
  })
  .post('/api/trigger/:id', handler());
```

### Custom Error Classes

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

class TaskError extends Error {
  constructor(message: string, public code: number) {
    super(message);
  }
}

const app = new Elysia()
  .error('TASK_ERROR', TaskError)
  .onError(({ error, code, set }) => {
    if (code === 'TASK_ERROR') {
      set.status = error.code;
      return { error: error.message };
    }
  })
  .post('/api/trigger/:id', ({ params }) => {
    if (!isValidTask(params.id)) {
      throw new TaskError('Invalid task ID', 400);
    }
    return handler()(...arguments);
  });
```

## WebSocket Support

Trigger tasks via WebSocket:

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const app = new Elysia()
  .ws('/ws/trigger', {
    message(ws, message) {
      const { taskId, payload } = JSON.parse(message);

      // Trigger task
      const result = await triggerTask(taskId, payload);

      ws.send(JSON.stringify({
        type: 'task-triggered',
        result
      }));
    }
  })
  .post('/api/trigger/:id', handler());
```

## Performance Optimization

### Response Caching

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const cache = new Map();

const app = new Elysia()
  .post('/api/trigger/:id', async ({ params, body }) => {
    const cacheKey = `${params.id}:${JSON.stringify(body)}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const result = await handler()(...arguments);
    cache.set(cacheKey, result);

    // Clear cache after 1 minute
    setTimeout(() => cache.delete(cacheKey), 60000);

    return result;
  });
```

### Static Code Generation

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

// Elysia compiles routes at startup for maximum performance
const app = new Elysia({
  aot: true // Ahead of Time compilation
})
  .post('/api/trigger/:id', handler())
  .compile(); // Pre-compile all routes
```

## Testing

### Unit Testing

```typescript
import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

describe('Trigger Endpoint', () => {
  const app = new Elysia()
    .post('/api/trigger/:id', handler());

  it('should trigger task successfully', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/trigger/test-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test User'
        })
      })
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
  });
});
```

### Integration Testing

```typescript
import { beforeAll, afterAll, describe, it, expect } from 'bun:test';
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

describe('Trigger API Integration', () => {
  let app: Elysia;

  beforeAll(() => {
    app = new Elysia()
      .post('/api/trigger/:id', handler())
      .listen(3001);
  });

  afterAll(() => {
    app.stop();
  });

  it('should handle real HTTP requests', async () => {
    const response = await fetch('http://localhost:3001/api/trigger/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'user@example.com'
      })
    });

    expect(response.status).toBe(200);
  });
});
```

## Deployment

### Bun Runtime

```dockerfile
FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
```

### Cluster Mode

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const createApp = () => new Elysia()
  .post('/api/trigger/:id', handler());

// Bun automatically handles clustering
const app = createApp()
  .listen({
    port: 3000,
    reusePort: true // Enable SO_REUSEPORT for load balancing
  });
```

## Advanced Patterns

### Dependency Injection

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

class TriggerService {
  async execute(id: string, payload: any) {
    // Custom logic
    return handler()(...arguments);
  }
}

const app = new Elysia()
  .decorate('services', {
    trigger: new TriggerService()
  })
  .post('/api/trigger/:id', ({ services, params, body }) =>
    services.trigger.execute(params.id, body)
  );
```

### Request Tracing

```typescript
import { Elysia } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

const app = new Elysia()
  .trace(async ({ beforeHandle, handle, request }) => {
    const start = performance.now();

    await beforeHandle;

    console.log('Request:', {
      method: request.method,
      url: request.url,
      duration: performance.now() - start
    });

    await handle;
  })
  .post('/api/trigger/:id', handler());
```

### Eden Treaty (Type-Safe Client)

```typescript
// server.ts
import { Elysia, t } from 'elysia';
import { handler } from 'trigger-adapters/elysia';

export const app = new Elysia()
  .post('/api/trigger/:id', handler(), {
    params: t.Object({ id: t.String() }),
    body: t.Object({ data: t.Any() })
  });

export type App = typeof app;

// client.ts
import { treaty } from '@elysiajs/eden';
import type { App } from './server';

const api = treaty<App>('http://localhost:3000');

// Fully typed client
const result = await api.api.trigger({ id: 'my-task' }).post({
  data: { name: 'Test' }
});
```

## Troubleshooting

### Common Issues

**Type inference not working**
- Ensure TypeScript strict mode is enabled
- Check that all schemas are defined

**Handler not executing**
- Verify route pattern matches
- Check middleware order

**Performance issues**
- Enable AOT compilation
- Use response caching where appropriate

## API Reference

### `handler()`

Returns an Elysia route handler that:
- Extracts task ID from context params
- Gets payload from request body
- Calls `tasks.trigger()` with the ID and payload
- Returns the result as JSON

```typescript
import { handler } from 'trigger-adapters/elysia';

// Basic usage
app.post('/trigger/:id', handler());
```

## Next Steps

- Learn about [general usage patterns](/guide/usage)
- Explore the [Hono adapter](/adapters/hono) for additional edge platforms
- Read the [Elysia documentation](https://elysiajs.com)