---
outline: deep
---

# Next.js Adapter

The Next.js adapter provides seamless integration with [Next.js](https://nextjs.org), supporting both App Router and Pages Router.

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

### App Router (Recommended)

Create a dynamic route handler in your app directory:

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';

export const POST = handler();
```

### Pages Router

Create an API route in your pages directory:

```typescript
// pages/api/trigger/[id].ts
import { handler } from 'trigger-adapters/nextjs';

export default handler();
```

## Route Patterns

### Dynamic Route Segments

The adapter automatically extracts the task ID from the dynamic route segment:

::: code-group

```typescript [App Router]
// app/api/trigger/[id]/route.ts
// Matches: POST /api/trigger/my-task-id
import { handler } from 'trigger-adapters/nextjs';

export const POST = handler();
```

```typescript [Pages Router]
// pages/api/trigger/[id].ts
// Matches: POST /api/trigger/my-task-id
import { handler } from 'trigger-adapters/nextjs';

export default handler();
```

:::

### Nested Routes

You can organize your trigger endpoints in nested structures:

```typescript
// app/api/v1/tasks/[id]/trigger/route.ts
// Matches: POST /api/v1/tasks/my-task-id/trigger
import { handler } from 'trigger-adapters/nextjs';

export const POST = handler();
```

## Advanced Usage

### Custom Error Handling

Wrap the handler for custom error handling and logging:

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Add custom logging
    console.log(`Triggering task: ${context.params.id}`);

    // Call the handler
    return await handler()(request, context);
  } catch (error) {
    console.error('Task trigger failed:', error);

    return NextResponse.json(
      { error: 'Failed to trigger task' },
      { status: 500 }
    );
  }
}
```

### Authentication & Authorization

Add authentication before triggering tasks:

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Verify authentication
  const token = request.headers.get('Authorization');

  if (!token || !await verifyToken(token)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Trigger the task
  return handler()(request, context);
}
```

### Request Validation

Validate request payload before triggering:

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const TaskPayloadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Parse and validate payload
  const body = await request.json();
  const validation = TaskPayloadSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: validation.error.errors },
      { status: 400 }
    );
  }

  // Trigger with validated payload
  return handler()(request, context);
}
```

## Middleware Integration

### Using Next.js Middleware

Apply middleware for all trigger endpoints:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is a trigger endpoint
  if (request.nextUrl.pathname.startsWith('/api/trigger')) {
    // Add rate limiting headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');

    return response;
  }
}

export const config = {
  matcher: '/api/trigger/:path*',
};
```

### Route-specific Middleware

Apply middleware to specific routes:

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Apply rate limiting
  const { success } = await rateLimit(request);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  return handler()(request, context);
}
```

## Environment Configuration

### Development vs Production

Configure different behaviors for different environments:

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Development-only logging
  if (process.env.NODE_ENV === 'development') {
    const body = await request.json();
    console.log('Task payload:', body);

    // Recreate request with body
    const newRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(body),
    });

    return handler()(newRequest, context);
  }

  return handler()(request, context);
}
```

### Environment Variables

```shell
# .env.local
TRIGGER_API_KEY=your-api-key
TRIGGER_API_URL=https://api.trigger.dev
```

## TypeScript Support

The adapter provides full TypeScript support with proper type inference:

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';
import type { NextRequest } from 'next/server';

// Types are automatically inferred
export const POST = handler();

// Custom typed payload
interface TaskPayload {
  userId: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, any>;
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const payload: TaskPayload = await request.json();

  // Type-safe payload handling
  console.log(`User ${payload.userId} triggered ${payload.action}`);

  return handler()(request, context);
}
```

## Testing

### Unit Testing

Test your trigger endpoints with Next.js testing utilities:

```typescript
// __tests__/api/trigger.test.ts
import { POST } from '@/app/api/trigger/[id]/route';
import { NextRequest } from 'next/server';

describe('Trigger API', () => {
  it('should trigger a task successfully', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/trigger/my-task',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test User' }),
      }
    );

    const response = await POST(request, {
      params: { id: 'my-task' },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('status');
  });

  it('should handle missing task ID', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/trigger/',
      {
        method: 'POST',
      }
    );

    const response = await POST(request, {
      params: { id: '' },
    });

    expect(response.status).toBe(400);
  });
});
```

### Integration Testing

Test with a running Next.js server:

```typescript
// __tests__/integration/trigger.test.ts
import { createMocks } from 'node-mocks-http';

describe('Trigger Integration', () => {
  it('should handle real trigger requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/trigger/send-email',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        to: 'user@example.com',
        subject: 'Test Email',
      },
    });

    // Test your endpoint
    const response = await fetch('http://localhost:3000/api/trigger/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    expect(response.status).toBe(200);
  });
});
```

## Deployment

### Vercel

The adapter works seamlessly with Vercel deployment:

```json
// vercel.json
{
  "functions": {
    "app/api/trigger/[id]/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Docker

Include in your Dockerfile:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## Performance Optimization

### Caching Strategies

Implement caching for frequently triggered tasks:

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

const getCachedTaskResult = unstable_cache(
  async (taskId: string, payload: any) => {
    // This would be your actual task trigger
    return handler()(request, context);
  },
  ['trigger-task'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['tasks'],
  }
);

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const payload = await request.json();

  // Check if this task can be cached
  if (context.params.id === 'cacheable-task') {
    return getCachedTaskResult(context.params.id, payload);
  }

  return handler()(request, context);
}
```

### Edge Runtime

Deploy to the Edge Runtime for better performance:

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';

export const runtime = 'edge';
export const POST = handler();
```

## Common Patterns

### Webhook Handler

Use the adapter for webhook processing:

```typescript
// app/api/webhooks/[provider]/route.ts
import { handler } from 'trigger-adapters/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: { provider: string } }
) {
  // Map webhook provider to task ID
  const taskMap: Record<string, string> = {
    stripe: 'process-stripe-webhook',
    github: 'process-github-webhook',
    slack: 'process-slack-webhook',
  };

  const taskId = taskMap[context.params.provider];

  if (!taskId) {
    return NextResponse.json(
      { error: 'Unknown webhook provider' },
      { status: 400 }
    );
  }

  // Trigger the appropriate task
  return handler()(request, { params: { id: taskId } });
}
```

### Batch Processing

Handle multiple task triggers in a single request:

```typescript
// app/api/trigger/batch/route.ts
import { handler } from 'trigger-adapters/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { tasks } = await request.json();

  const results = await Promise.all(
    tasks.map(async ({ id, payload }: any) => {
      const taskRequest = new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return handler()(taskRequest, { params: { id } });
    })
  );

  return NextResponse.json({ results });
}
```

## Troubleshooting

### Common Issues

**Dynamic route not matching**
- Ensure your file is named correctly: `[id]` for dynamic segments
- Check that you're using the POST method

**Request body is empty**
- Make sure to set `Content-Type: application/json` header
- Verify the body is valid JSON

**Type errors with App Router**
- Ensure you're using the correct imports from `next/server`
- Update to the latest version of Next.js

## API Reference

### `handler()`

Returns a Next.js route handler that:
- Extracts task ID from route params
- Parses JSON body from the request
- Calls `tasks.trigger()` with the ID and payload
- Returns the result as JSON response

```typescript
import { handler } from 'trigger-adapters/nextjs';

// App Router
export const POST = handler();

// Pages Router
export default handler();
```

## Next Steps

- Learn about [general usage patterns](/guide/usage)
- Explore the [Hono adapter](/adapters/hono) for edge deployments
- Read the [Next.js documentation](https://nextjs.org/docs)