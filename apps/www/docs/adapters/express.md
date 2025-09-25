---
outline: deep
---

# Express Adapter

The Express adapter provides integration with [Express](https://expressjs.com/), the fast, unopinionated, minimalist web framework for Node.js.

## Installation

::: code-group

```bash [npm]
npm install trigger-adapters express
```

```bash [yarn]
yarn add trigger-adapters express
```

```bash [pnpm]
pnpm add trigger-adapters express
```

```bash [bun]
bun add trigger-adapters express
```

:::

## Basic Usage

```javascript
import express from 'express';
import { handler } from 'trigger-adapters/express';

const app = express();

// Add body parser middleware (required)
app.use(express.json());

// Add the trigger endpoint
app.post('/api/trigger/:id', handler());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Route Configuration

### Single Endpoint

Handle triggers for specific tasks:

```javascript
// Single task endpoint
app.post('/api/trigger/:id', handler());
```

### Multiple Endpoints

Organize different task groups:

```javascript
// User-related tasks
app.post('/api/users/trigger/:id', handler());

// Email tasks
app.post('/api/emails/trigger/:id', handler());

// Background jobs
app.post('/api/jobs/trigger/:id', handler());
```

### Router-based Setup

Use Express Router for better organization:

```javascript
import { Router } from 'express';
import { handler } from 'trigger-adapters/express';

const triggerRouter = Router();

// All trigger routes
triggerRouter.post('/:id', handler());

// Mount the router
app.use('/api/trigger', triggerRouter);
```

## Middleware Integration

### Authentication Middleware

Protect your trigger endpoints:

```javascript
import { handler } from 'trigger-adapters/express';

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || !isValidToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Protected trigger endpoint
app.post('/api/trigger/:id', authenticate, handler());
```

### Rate Limiting

Prevent abuse with rate limiting:

```javascript
import rateLimit from 'express-rate-limit';
import { handler } from 'trigger-adapters/express';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Rate-limited endpoint
app.post('/api/trigger/:id', limiter, handler());
```

### CORS Configuration

Enable cross-origin requests:

```javascript
import cors from 'cors';
import { handler } from 'trigger-adapters/express';

// Enable CORS for specific origins
app.use(cors({
  origin: ['http://localhost:3000', 'https://myapp.com'],
  methods: ['POST'],
  credentials: true,
}));

app.post('/api/trigger/:id', handler());
```

## Advanced Usage

### Custom Error Handling

Wrap the handler for custom error handling:

```javascript
import { handler } from 'trigger-adapters/express';

app.post('/api/trigger/:id', async (req, res, next) => {
  try {
    // Log the trigger attempt
    console.log(`Triggering task: ${req.params.id}`);

    // Call the handler
    await handler()(req, res, next);
  } catch (error) {
    console.error('Task trigger failed:', error);

    // Custom error response
    res.status(500).json({
      error: 'Failed to trigger task',
      message: error.message,
    });
  }
});
```

### Request Validation

Validate payloads before triggering:

```javascript
import { body, validationResult } from 'express-validator';
import { handler } from 'trigger-adapters/express';

app.post('/api/trigger/:id',
  // Validation rules
  body('email').isEmail(),
  body('name').notEmpty(),

  // Check validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },

  // Trigger handler
  handler()
);
```

### Request Context

Add context to requests:

```javascript
import { handler } from 'trigger-adapters/express';

// Middleware to add context
app.use((req, res, next) => {
  req.context = {
    requestId: generateRequestId(),
    timestamp: Date.now(),
    userAgent: req.get('user-agent'),
  };
  next();
});

app.post('/api/trigger/:id', async (req, res, next) => {
  // Log with context
  console.log(`Request ${req.context.requestId}: Triggering ${req.params.id}`);

  // Call handler
  await handler()(req, res, next);

  // Log completion
  console.log(`Request ${req.context.requestId}: Completed`);
});
```

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import express, { Request, Response, NextFunction } from 'express';
import { handler } from 'trigger-adapters/express';

const app = express();

// Typed middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Authentication logic
  req.user = { id: '123', email: 'user@example.com' };
  next();
};

// Typed route handler
app.post('/api/trigger/:id',
  authenticate,
  handler()
);

// Custom typed payload
interface TaskPayload {
  userId: string;
  action: string;
  data: Record<string, any>;
}

app.post('/api/trigger/:id', async (
  req: Request<{ id: string }, any, TaskPayload>,
  res: Response,
  next: NextFunction
) => {
  // Type-safe access to payload
  console.log(`User ${req.body.userId} triggered ${req.body.action}`);

  return handler()(req, res, next);
});
```

## Error Handling

### Global Error Handler

Catch all errors from trigger endpoints:

```javascript
import { handler } from 'trigger-adapters/express';

app.post('/api/trigger/:id', handler());

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  res.status(500).json({
    error: 'Internal server error',
  });
});
```

### Async Error Handling

Handle async errors properly:

```javascript
import { handler } from 'trigger-adapters/express';
import asyncHandler from 'express-async-handler';

// Wrap async routes
app.post('/api/trigger/:id', asyncHandler(async (req, res, next) => {
  // Async operations
  await someAsyncOperation();

  // Call handler
  return handler()(req, res, next);
}));
```

## Testing

### Unit Testing

Test your Express routes:

```javascript
import request from 'supertest';
import express from 'express';
import { handler } from 'trigger-adapters/express';

describe('Trigger API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/api/trigger/:id', handler());
  });

  it('should trigger a task', async () => {
    const response = await request(app)
      .post('/api/trigger/my-task')
      .send({ name: 'Test User' })
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('status');
  });

  it('should return 400 for missing task ID', async () => {
    const response = await request(app)
      .post('/api/trigger/')
      .expect(404); // Express returns 404 for unmatched routes
  });
});
```

### Integration Testing

Test with a real Express server:

```javascript
import axios from 'axios';

describe('Trigger Integration', () => {
  const API_URL = 'http://localhost:3000';

  it('should trigger task via API', async () => {
    const response = await axios.post(
      `${API_URL}/api/trigger/send-email`,
      {
        to: 'user@example.com',
        subject: 'Test Email',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      }
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
  });
});
```

## Deployment

### PM2 Configuration

Deploy with PM2 process manager:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'trigger-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.example.com;

    location /api/trigger {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Performance Optimization

### Request Body Size Limit

Configure body parser limits:

```javascript
import express from 'express';
import { handler } from 'trigger-adapters/express';

const app = express();

// Limit body size to 10MB
app.use(express.json({ limit: '10mb' }));

app.post('/api/trigger/:id', handler());
```

### Response Compression

Enable gzip compression:

```javascript
import compression from 'compression';
import { handler } from 'trigger-adapters/express';

const app = express();

// Enable compression
app.use(compression());

app.use(express.json());
app.post('/api/trigger/:id', handler());
```

### Connection Pooling

Optimize database connections:

```javascript
import { createPool } from 'mysql2/promise';
import { handler } from 'trigger-adapters/express';

// Create connection pool
const pool = createPool({
  host: 'localhost',
  user: 'user',
  database: 'database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Make pool available to handlers
app.locals.db = pool;

app.post('/api/trigger/:id', handler());
```

## Common Patterns

### Webhook Processing

Handle webhooks from external services:

```javascript
import crypto from 'crypto';
import { handler } from 'trigger-adapters/express';

// Webhook signature verification
const verifyWebhook = (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};

// Webhook endpoint
app.post('/webhooks/:provider',
  express.raw({ type: 'application/json' }),
  verifyWebhook,
  (req, res) => {
    const provider = req.params.provider;
    const taskId = `process-${provider}-webhook`;

    // Trigger the appropriate task
    req.params.id = taskId;
    return handler()(req, res);
  }
);
```

### Batch Processing

Handle multiple triggers in one request:

```javascript
import { handler } from 'trigger-adapters/express';

app.post('/api/trigger/batch', async (req, res) => {
  const { tasks } = req.body;
  const results = [];

  for (const task of tasks) {
    // Create a mock request for each task
    const mockReq = {
      ...req,
      params: { id: task.id },
      body: task.payload,
    };

    const mockRes = {
      json: (data) => results.push(data),
      status: () => mockRes,
    };

    await handler()(mockReq, mockRes, () => {});
  }

  res.json({ results });
});
```

## Troubleshooting

### Common Issues

**Body parser not configured**
- Ensure `app.use(express.json())` is called before the handler
- Check that Content-Type header is set to `application/json`

**Route not matching**
- Verify the route pattern includes `:id` parameter
- Check that the HTTP method is POST

**Middleware order issues**
- Middleware must be added in the correct order
- Body parser must come before the handler

## API Reference

### `handler()`

Returns an Express middleware function that:
- Extracts task ID from `req.params.id`
- Gets payload from `req.body`
- Calls `tasks.trigger()` with the ID and payload
- Sends the result via `res.json()`

```javascript
import { handler } from 'trigger-adapters/express';

// Basic usage
app.post('/trigger/:id', handler());
```

## Next Steps

- Learn about [general usage patterns](/guide/usage)
- Explore the [Next.js adapter](/adapters/nextjs) for Next.js applications
- Explore the [Hono adapter](/adapters/hono) for edge deployments
- Read the [Express documentation](https://expressjs.com/)