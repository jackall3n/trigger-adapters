---
outline: deep
---

# Introduction

Trigger Adapters is a lightweight library that provides framework-specific HTTP handlers for [Trigger.dev](https://trigger.dev), making it easy to expose your background tasks via REST endpoints in any web framework.

## What is Trigger Adapters?

When building applications with Trigger.dev, you often need to trigger your background tasks via HTTP endpoints. While Trigger.dev provides excellent SDK support, integrating it with different web frameworks requires writing boilerplate code to:

- Extract task IDs from request parameters
- Parse request payloads
- Call the Trigger.dev SDK
- Format and return responses

Trigger Adapters eliminates this boilerplate by providing pre-built, framework-specific handlers that follow each framework's conventions and best practices.

## Key Features

### 🎯 Framework-Specific Adapters
Pre-built adapters for popular frameworks including Next.js, Hono, and Express. Each adapter is tailored to work idiomatically with its framework.

### 🔌 Simple Integration
Just import the adapter for your framework and connect it to your route handler. No complex configuration required.

### 📦 Minimal Dependencies
The library is designed to be lightweight with minimal dependencies. We only wrap what's necessary to connect your framework to Trigger.dev.

### 🛠️ TypeScript Support
Full TypeScript support with proper type inference for requests and responses, ensuring type safety across your application.

## Why Use Trigger Adapters?

### Without Trigger Adapters

```typescript
// Next.js API route without trigger-adapters
// app/api/trigger/[id]/route.ts
import { tasks } from '@trigger.dev/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const taskId = params.id;

  if (!taskId) {
    return NextResponse.json(
      { error: 'Task ID is required' },
      { status: 400 }
    );
  }

  try {
    const payload = await request.json();
    const result = await tasks.trigger(taskId, payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### With Trigger Adapters

```typescript
// Next.js API route with trigger-adapters
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';

export const POST = handler();
```

The adapter handles all the boilerplate for you:
- Extracts the task ID from params
- Validates required parameters
- Calls the Trigger.dev SDK
- Returns properly formatted responses
- Handles errors appropriately

## Installation

Install the package using your preferred package manager:

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

## Prerequisites

Before using Trigger Adapters, ensure you have:

1. **Trigger.dev SDK** installed and configured in your project
2. **A Trigger.dev account** with your tasks set up
3. **One of the supported frameworks** (Express, Next.js, Hono)

## Quick Start

### Next.js App Router

```typescript
// app/api/trigger/[id]/route.ts
import { handler } from 'trigger-adapters/nextjs';

// Export the handler as the POST method
export const POST = handler();
```

### Hono (Cloudflare Workers)

```typescript
// src/index.ts
import { Hono } from 'hono';
import { handler } from 'trigger-adapters/hono';

const app = new Hono();

// Create an endpoint to trigger tasks
app.post('/api/trigger/:id', handler());

export default app;
```

Now you can trigger any of your Trigger.dev tasks by making a POST request to `/api/trigger/[task-id]` with your payload in the request body.

## Supported Frameworks

Currently, Trigger Adapters supports the following frameworks:

- **Next.js** - Full-stack React framework with API routes (App Router and Pages Router)
- **Hono** - Ultra-fast web framework for the Edge (Cloudflare Workers, Deno, Bun)
- **Express** - The most popular Node.js web framework

More frameworks are being added. Feel free to [contribute](https://github.com/jackall3n/trigger-adapters) or [request support](https://github.com/jackall3n/trigger-adapters/issues) for your favorite framework.

## How It Works

Trigger Adapters follows a simple pattern across all frameworks:

1. **Extract Task ID**: Gets the task identifier from the request parameters
2. **Get Payload**: Extracts the payload from the request body
3. **Trigger Task**: Calls `tasks.trigger()` from the Trigger.dev SDK
4. **Return Response**: Sends back the result in the appropriate format for the framework

Each adapter is optimized for its specific framework while maintaining this consistent behavior.

## Next Steps

- Learn how to [use Trigger Adapters](/guide/usage) in your application
- Explore the framework-specific guides:
  - [Next.js Adapter](/adapters/nextjs)
  - [Hono Adapter](/adapters/hono)
  - [Express Adapter](/adapters/express)
- Check out the [GitHub repository](https://github.com/jackall3n/trigger-adapters) for more examples