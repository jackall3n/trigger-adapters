---
outline: deep
---

# Fastify Adapter

The Fastify adapter provides integration with [Fastify](https://fastify.dev/), one of the fastest web frameworks for Node.js with excellent developer experience.

## Installation

::: code-group

```bash [npm]
npm install trigger-adapters fastify
```

```bash [yarn]
yarn add trigger-adapters fastify
```

```bash [pnpm]
pnpm add trigger-adapters fastify
```

```bash [bun]
bun add trigger-adapters fastify
```

:::

## Basic Usage

```typescript
import Fastify from 'fastify';
import { handler } from 'trigger-adapters/fastify';

const fastify = Fastify({ logger: true });

// Register the trigger handler
fastify.post('/api/trigger/:id', handler());

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
```

## Route Registration

### Using Route Method

```typescript
import { handler } from 'trigger-adapters/fastify';

// Simple route registration
fastify.post('/api/trigger/:id', handler());

// With route options
fastify.post('/api/trigger/:id', {
  handler: handler(),
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      }
    }
  }
});
```

### Using Register Plugin

Create a plugin for better organization:

```typescript
import { FastifyPluginAsync } from 'fastify';
import { handler } from 'trigger-adapters/fastify';

const triggerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.post('/:id', handler());
};

// Register with prefix
fastify.register(triggerPlugin, { prefix: '/api/trigger' });
```

## Schema Validation

Fastify's built-in schema validation works seamlessly:

```typescript
import { handler } from 'trigger-adapters/fastify';

const schema = {
  body: {
    type: 'object',
    required: ['email', 'name'],
    properties: {
      email: { type: 'string', format: 'email' },
      name: { type: 'string', minLength: 1 }
    }
  },
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' }
      }
    }
  }
};

fastify.post('/api/trigger/:id', {
  schema,
  handler: handler()
});
```

## Authentication & Authorization

### Using @fastify/auth

```typescript
import fastifyAuth from '@fastify/auth';
import { handler } from 'trigger-adapters/fastify';

await fastify.register(fastifyAuth);

// Define auth strategies
async function verifyToken(request, reply) {
  const token = request.headers.authorization;
  if (!token) throw new Error('Missing token');
  // Verify token logic
}

async function verifyApiKey(request, reply) {
  const apiKey = request.headers['x-api-key'];
  if (!apiKey) throw new Error('Missing API key');
  // Verify API key logic
}

// Use with trigger endpoint
fastify.post('/api/trigger/:id', {
  preHandler: fastify.auth([verifyToken, verifyApiKey]),
  handler: handler()
});
```

### Using Hooks

```typescript
import { handler } from 'trigger-adapters/fastify';

// Add authentication hook
fastify.addHook('preHandler', async (request, reply) => {
  if (request.url.startsWith('/api/trigger/')) {
    const token = request.headers.authorization;

    if (!token || !isValidToken(token)) {
      reply.code(401).send({ error: 'Unauthorized' });
      return;
    }

    // Add user to request
    request.user = await getUserFromToken(token);
  }
});

fastify.post('/api/trigger/:id', handler());
```

## Rate Limiting

Using @fastify/rate-limit:

```typescript
import rateLimit from '@fastify/rate-limit';
import { handler } from 'trigger-adapters/fastify';

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes'
});

fastify.post('/api/trigger/:id', {
  config: {
    rateLimit: {
      max: 10,
      timeWindow: '1 minute'
    }
  },
  handler: handler()
});
```

## Error Handling

### Custom Error Handler

```typescript
import { handler } from 'trigger-adapters/fastify';

fastify.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    reply.status(400).send({
      error: 'Validation Error',
      details: error.validation
    });
    return;
  }

  if (error.statusCode === 429) {
    reply.status(429).send({
      error: 'Too Many Requests',
      retryAfter: error.retryAfter
    });
    return;
  }

  // Log error
  fastify.log.error(error);

  // Send generic error
  reply.status(500).send({
    error: 'Internal Server Error'
  });
});

fastify.post('/api/trigger/:id', handler());
```

### Async Error Handling

```typescript
import { handler } from 'trigger-adapters/fastify';

fastify.post('/api/trigger/:id', async (request, reply) => {
  try {
    // Pre-processing
    await validateRequest(request);

    // Call handler
    return await handler()(request, reply);
  } catch (error) {
    request.log.error(error);
    throw error; // Let Fastify handle it
  }
});
```

## Middleware & Plugins

### CORS Configuration

```typescript
import cors from '@fastify/cors';
import { handler } from 'trigger-adapters/fastify';

await fastify.register(cors, {
  origin: ['https://app.example.com'],
  credentials: true,
  methods: ['POST']
});

fastify.post('/api/trigger/:id', handler());
```

### Request Context

```typescript
import { FastifyRequest } from 'fastify';
import { handler } from 'trigger-adapters/fastify';

// Decorate request with context
fastify.decorateRequest('context', null);

fastify.addHook('onRequest', async (request) => {
  request.context = {
    requestId: request.id,
    timestamp: Date.now(),
    ip: request.ip
  };
});

// Use in handler wrapper
fastify.post('/api/trigger/:id', async (request, reply) => {
  request.log.info({ context: request.context }, 'Triggering task');
  return handler()(request, reply);
});
```

## TypeScript Support

Full TypeScript support with type inference:

```typescript
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { handler } from 'trigger-adapters/fastify';

interface TaskPayload {
  userId: string;
  action: string;
  metadata: Record<string, any>;
}

interface TaskParams {
  id: string;
}

type TaskRequest = FastifyRequest<{
  Body: TaskPayload;
  Params: TaskParams;
}>;

// Typed route handler
fastify.post<{
  Body: TaskPayload;
  Params: TaskParams;
}>('/api/trigger/:id', async (request, reply) => {
  // Type-safe access
  console.log(`User ${request.body.userId} triggering ${request.params.id}`);

  return handler()(request, reply);
});
```

## Performance Optimization

### JSON Schema Compilation

```typescript
import { handler } from 'trigger-adapters/fastify';

// Pre-compile schemas for better performance
const bodySchema = {
  $id: 'taskPayload',
  type: 'object',
  properties: {
    data: { type: 'object' }
  }
};

fastify.addSchema(bodySchema);

fastify.post('/api/trigger/:id', {
  schema: {
    body: { $ref: 'taskPayload#' }
  },
  handler: handler()
});
```

### Compression

```typescript
import compress from '@fastify/compress';
import { handler } from 'trigger-adapters/fastify';

await fastify.register(compress, {
  global: true,
  threshold: 1024
});

fastify.post('/api/trigger/:id', handler());
```

## Testing

### Unit Testing

```typescript
import Fastify from 'fastify';
import tap from 'tap';
import { handler } from 'trigger-adapters/fastify';

tap.test('Trigger endpoint', async (t) => {
  const fastify = Fastify();

  fastify.post('/api/trigger/:id', handler());

  const response = await fastify.inject({
    method: 'POST',
    url: '/api/trigger/test-task',
    payload: {
      name: 'Test User'
    }
  });

  t.equal(response.statusCode, 200);
  t.ok(JSON.parse(response.body).id);
});
```

### Integration Testing

```typescript
import { build } from './app';

describe('Trigger API', () => {
  let app;

  beforeEach(async () => {
    app = build({ logger: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should trigger task', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/trigger/send-email',
      headers: {
        'authorization': 'Bearer test-token'
      },
      payload: {
        to: 'user@example.com'
      }
    });

    expect(response.statusCode).toBe(200);
  });
});
```

## Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Clustering

```typescript
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const cpuCount = os.cpus().length;

  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Start Fastify server
  startServer();
}
```

## Advanced Patterns

### Request Queuing

```typescript
import { handler } from 'trigger-adapters/fastify';
import pLimit from 'p-limit';

const limit = pLimit(10); // Max 10 concurrent triggers

fastify.post('/api/trigger/:id', async (request, reply) => {
  return limit(async () => {
    return handler()(request, reply);
  });
});
```

### Circuit Breaker

```typescript
import CircuitBreaker from 'opossum';
import { handler } from 'trigger-adapters/fastify';

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const breaker = new CircuitBreaker(handler(), options);

fastify.post('/api/trigger/:id', async (request, reply) => {
  try {
    return await breaker.fire(request, reply);
  } catch (error) {
    if (breaker.opened) {
      reply.status(503).send({
        error: 'Service temporarily unavailable'
      });
    }
    throw error;
  }
});
```

## Troubleshooting

### Common Issues

**Route not found**
- Ensure route is registered before server starts
- Check route path and method match exactly

**Serialization errors**
- Add proper response schema
- Use `reply.type('application/json')`

**Memory leaks**
- Avoid storing large objects in closures
- Use fastify instance decorators carefully

## API Reference

### `handler()`

Returns a Fastify route handler that:
- Extracts task ID from `request.params.id`
- Gets payload from `request.body`
- Calls `tasks.trigger()` with the ID and payload
- Returns the result as JSON

```typescript
import { handler } from 'trigger-adapters/fastify';

// Basic usage
fastify.post('/trigger/:id', handler());
```

## Next Steps

- Learn about [general usage patterns](/guide/usage)
- Explore the [Hono adapter](/adapters/hono) for edge deployments
- Read the [Fastify documentation](https://fastify.dev)