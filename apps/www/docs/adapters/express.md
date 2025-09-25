---
outline: deep
---

# Express Adapter

This adapter is for use with Express.

## Usage

```typescript
import express from 'express'
import { handler } from 'trigger-adapters/express'

const app = express()

app.use("/trigger/*", handler())

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
```