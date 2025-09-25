---
outline: deep
---

# Next.js Adapter

This adapter is for use with Next.js.

## Usage

Create a catch-all route handler for the `/trigger` endpoint. By default, the handler will infer the task id from the end of the route.

::: code-group

```ts [app/api/trigger/[[...all]]/route.ts]
import { handler } from "trigger-adapters/nextjs";

export const { POST } = handler();
```


```ts [pages/api/[...all].ts]
import { handler } from "trigger-adapters/nextjs";

const { handle } = handler();

export default handle;
```

:::

