---
outline: deep
---

# Usage Guide

Learn how to use Trigger Adapters in your application with different frameworks and configurations.

## Basic Setup

### Step 1: Install Dependencies

First, install both the Trigger.dev SDK and Trigger Adapters:

::: code-group

```bash [npm]
npm install @trigger.dev/sdk trigger-adapters
```

```bash [yarn]
yarn add @trigger.dev/sdk trigger-adapters
```

```bash [pnpm]
pnpm add @trigger.dev/sdk trigger-adapters
```

```bash [bun]
bun add @trigger.dev/sdk trigger-adapters
```

:::

### Step 2: Configure Trigger.dev

Set up your Trigger.dev configuration according to the [official documentation](https://trigger.dev/docs).

### Step 3: Import and Use the Adapter

Import the adapter for your framework and use it in your route handlers.

## Framework Examples

### Next.js App Router

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';

export const POST = handler();
```

### Next.js Pages Router

```typescript
// pages/api/trigger/[id].ts
import { handler } from 'trigger-adapters/nextjs';

export default handler();
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

## Making Requests

Once your endpoint is set up, you can trigger tasks by making POST requests:

### Using fetch

```javascript
const response = await fetch('/api/trigger/my-task-id', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    // Your task payload
    name: 'John Doe',
    email: 'john@example.com',
  }),
});

const result = await response.json();
```

### Using cURL

```bash
curl -X POST http://localhost:3000/api/trigger/my-task-id \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

## Response Format

All adapters return a consistent response format:

### Success Response

```json
{
  "id": "run_abc123",
  "status": "pending",
  "taskIdentifier": "my-task-id",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "error": "Task ID is required"
}
```

## Error Handling

The adapters handle common errors automatically:

- **Missing Task ID**: Returns 400 Bad Request
- **Invalid Payload**: Returns 400 Bad Request
- **Task Not Found**: Returns 404 Not Found
- **Server Errors**: Returns 500 Internal Server Error

## Advanced Configuration

### Custom Error Handling

While the adapters provide default error handling, you can wrap them for custom behavior:

```typescript
// Next.js example with custom error handling
import { handler } from 'trigger-adapters/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, context: any) {
  try {
    // Add custom authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call the handler
    return handler()(request, context);
  } catch (error) {
    // Custom error logging
    console.error('Task trigger failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### Middleware Integration

You can combine adapters with middleware for authentication, rate limiting, etc.:

```typescript
// Hono example with middleware
import { Hono } from 'hono';
import { handler } from 'trigger-adapters/hono';
import { bearerAuth } from 'hono/bearer-auth';

const app = new Hono();

// Add authentication middleware
app.use('/api/trigger/*', bearerAuth({ token: 'secret-token' }));

// Add the trigger handler
app.post('/api/trigger/:id', handler());

export default app;
```

## Best Practices

1. **Security**: Always authenticate and authorize requests to your trigger endpoints
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Logging**: Add logging to track task triggers and failures
4. **Error Handling**: Provide meaningful error messages to clients
5. **Validation**: Validate payloads before triggering tasks

## TypeScript Support

All adapters are written in TypeScript and provide full type support:

```typescript
import { handler } from 'trigger-adapters/nextjs';
import type { NextRequest } from 'next/server';

// The handler is fully typed
export const POST = handler();

// You can also type your payload
interface TaskPayload {
  name: string;
  email: string;
}

// When triggering
const payload: TaskPayload = {
  name: 'John Doe',
  email: 'john@example.com',
};
```

## Troubleshooting

### Common Issues

**Task not found**
- Ensure your task ID matches exactly with the registered task
- Check that Trigger.dev is properly configured

**Authentication errors**
- Verify your Trigger.dev API keys are set correctly
- Check environment variables are loaded

**Payload issues**
- Ensure the request body is valid JSON
- Check Content-Type header is set to `application/json`

### Getting Help

- Check the [GitHub Issues](https://github.com/jackall3n/trigger-adapters/issues)
- Read the [Trigger.dev Documentation](https://trigger.dev/docs)
- Open a new issue if you encounter a bug

## Next Steps

- Explore framework-specific guides:
  - [Next.js Adapter](/adapters/nextjs)
  - [Hono Adapter](/adapters/hono)
  - [Express Adapter](/adapters/express)
- Learn about [Trigger.dev concepts](https://trigger.dev/docs)