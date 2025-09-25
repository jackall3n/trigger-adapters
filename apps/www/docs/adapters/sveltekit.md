---
outline: deep
---

# SvelteKit Adapter

The SvelteKit adapter provides integration with [SvelteKit](https://kit.svelte.dev/), the official application framework for Svelte with full-stack capabilities.

## Installation

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

## Basic Usage

Create an API route in your SvelteKit application:

```typescript
// src/routes/api/trigger/[id]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';

export const POST = handler();
```

## Route Patterns

### Dynamic Parameters

```typescript
// src/routes/api/trigger/[id]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = handler();
```

### Multiple Parameters

```typescript
// src/routes/api/[version]/trigger/[id]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
  console.log(`API version: ${params.version}`);
  console.log(`Task ID: ${params.id}`);

  return handler()({ params, request });
};
```

### Optional Parameters

```typescript
// src/routes/api/trigger/[[id]]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';
import { error } from '@sveltejs/kit';

export const POST = async ({ params, request }) => {
  if (!params.id) {
    throw error(400, 'Task ID is required');
  }

  return handler()({ params, request });
};
```

## Authentication & Authorization

### Using Hooks

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Check authentication for trigger endpoints
  if (event.url.pathname.startsWith('/api/trigger/')) {
    const token = event.request.headers.get('authorization');

    if (!token || !isValidToken(token)) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Add user to locals
    event.locals.user = await getUserFromToken(token);
  }

  return resolve(event);
};
```

### Protected Routes

```typescript
// src/routes/api/trigger/[id]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  // Access user from locals (set in hooks)
  if (!event.locals.user) {
    throw error(401, 'Unauthorized');
  }

  // Check permissions
  if (!event.locals.user.canTriggerTasks) {
    throw error(403, 'Forbidden');
  }

  return handler()(event);
};
```

## Request Validation

### Using Zod

```typescript
// src/routes/api/trigger/[id]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const PayloadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  metadata: z.record(z.any()).optional()
});

export const POST: RequestHandler = async (event) => {
  const body = await event.request.json();

  const validation = PayloadSchema.safeParse(body);

  if (!validation.success) {
    throw error(400, {
      message: 'Invalid payload',
      errors: validation.error.errors
    });
  }

  // Create new request with validated body
  const validatedRequest = new Request(event.request.url, {
    method: 'POST',
    headers: event.request.headers,
    body: JSON.stringify(validation.data)
  });

  return handler()({
    ...event,
    request: validatedRequest
  });
};
```

### Form Actions Integration

Trigger from form actions:

```typescript
// src/routes/dashboard/+page.server.ts
import { handler } from 'trigger-adapters/sveltekit';
import type { Actions } from './$types';

export const actions: Actions = {
  triggerTask: async ({ request, params }) => {
    const formData = await request.formData();
    const taskId = formData.get('taskId');
    const payload = {
      email: formData.get('email'),
      name: formData.get('name')
    };

    // Create trigger request
    const triggerRequest = new Request(`/api/trigger/${taskId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await handler()({
      params: { id: taskId },
      request: triggerRequest
    });

    return {
      success: true,
      result: await result.json()
    };
  }
};
```

## Error Handling

### Custom Error Responses

```typescript
// src/routes/api/trigger/[id]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  try {
    return await handler()(event);
  } catch (err) {
    console.error('Trigger failed:', err);

    if (err.code === 'TASK_NOT_FOUND') {
      throw error(404, 'Task not found');
    }

    if (err.code === 'RATE_LIMITED') {
      return json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        }
      );
    }

    throw error(500, 'Internal server error');
  }
};
```

### Global Error Handling

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Error {
      code?: string;
      details?: any;
    }
  }
}

// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, event }) => {
  if (event.url.pathname.startsWith('/api/trigger/')) {
    console.error('Trigger endpoint error:', {
      url: event.url.pathname,
      error
    });

    return {
      message: 'Task trigger failed',
      code: error?.code || 'UNKNOWN'
    };
  }
};
```

## Load Functions Integration

Trigger tasks from load functions:

```svelte
<!-- src/routes/tasks/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1>Task Results</h1>
<pre>{JSON.stringify(data.taskResult, null, 2)}</pre>
```

```typescript
// src/routes/tasks/+page.server.ts
import { handler } from 'trigger-adapters/sveltekit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  // Trigger task during page load
  const response = await fetch('/api/trigger/generate-report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reportType: 'weekly'
    })
  });

  const taskResult = await response.json();

  return {
    taskResult
  };
};
```

## Environment Variables

```typescript
// src/routes/api/trigger/[id]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  // Check environment
  if (!env.TRIGGER_API_KEY) {
    throw error(500, 'Trigger.dev not configured');
  }

  // Validate API key from request
  const apiKey = event.request.headers.get('x-api-key');
  if (apiKey !== env.API_KEY) {
    throw error(401, 'Invalid API key');
  }

  return handler()(event);
};
```

## TypeScript Support

### Typed Parameters

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

// src/routes/api/trigger/[id]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';
import type { RequestHandler } from './$types';

interface TaskPayload {
  userId: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, any>;
}

export const POST: RequestHandler = async (event) => {
  const payload: TaskPayload = await event.request.json();

  console.log(`User ${payload.userId} triggered ${event.params.id}`);

  return handler()(event);
};
```

## Testing

### Unit Testing

```typescript
// src/routes/api/trigger/[id]/+server.test.ts
import { describe, it, expect } from 'vitest';
import { POST } from './+server';

describe('Trigger endpoint', () => {
  it('should trigger task successfully', async () => {
    const request = new Request('http://localhost/api/trigger/test-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User'
      })
    });

    const response = await POST({
      request,
      params: { id: 'test-task' },
      locals: {},
      platform: {}
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
  });
});
```

### Integration Testing

```typescript
// tests/api.test.ts
import { expect, test } from '@playwright/test';

test('trigger API endpoint', async ({ request }) => {
  const response = await request.post('/api/trigger/send-notification', {
    data: {
      userId: 'user-123',
      message: 'Test notification'
    },
    headers: {
      'Authorization': 'Bearer test-token'
    }
  });

  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.status).toBe('pending');
});
```

## Deployment

### Vercel

```json
// vercel.json
{
  "functions": {
    "src/routes/api/trigger/[id]/+server.ts": {
      "maxDuration": 30
    }
  }
}
```

### Node.js Adapter

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: true
    })
  }
};
```

### Cloudflare Pages

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter()
  }
};
```

## Advanced Patterns

### Streaming Responses

```typescript
// src/routes/api/trigger/[id]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial response
      controller.enqueue(encoder.encode('data: Starting task...\n\n'));

      // Trigger task
      const result = await handler()(event);
      const data = await result.json();

      // Send result
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
      );

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  });
};
```

### Request Queue

```typescript
// src/routes/api/trigger/[id]/+server.ts
import { handler } from 'trigger-adapters/sveltekit';
import { RateLimiter } from 'sveltekit-rate-limiter/server';
import type { RequestHandler } from './$types';

const limiter = new RateLimiter({
  IP: [10, '1m'], // 10 requests per minute per IP
  IPUA: [5, '1m'] // 5 requests per minute per IP+User-Agent
});

export const POST: RequestHandler = async (event) => {
  const status = await limiter.check(event);

  if (!status.success) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'Retry-After': status.retryAfter.toString()
      }
    });
  }

  return handler()(event);
};
```

### Server-Sent Events

```svelte
<!-- src/routes/tasks/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  let status = '';

  onMount(() => {
    const eventSource = new EventSource('/api/trigger/long-task/stream');

    eventSource.onmessage = (event) => {
      status = event.data;
    };

    return () => eventSource.close();
  });
</script>

<h1>Task Status: {status}</h1>
```

## Troubleshooting

### Common Issues

**Dynamic imports not working**
- Ensure proper Vite configuration
- Check adapter compatibility

**Request body is empty**
- Make sure to await `request.json()`
- Check Content-Type header

**Type errors**
- Run `npm run check` to verify types
- Ensure `./$types` imports are correct

## API Reference

### `handler()`

Returns a SvelteKit request handler that:
- Extracts task ID from `event.params.id`
- Gets payload from `event.request` body
- Calls `tasks.trigger()` with the ID and payload
- Returns a Response object

```typescript
import { handler } from 'trigger-adapters/sveltekit';

// Basic usage
export const POST = handler();
```

## Next Steps

- Learn about [general usage patterns](/guide/usage)
- Explore the [Next.js adapter](/adapters/nextjs) for React applications
- Read the [SvelteKit documentation](https://kit.svelte.dev)