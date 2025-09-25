import type { Context } from "hono";
import { trigger } from "./core";

export function handler(): (c: Context) => Promise<Response> {
  return async (c: Context) => {
    const task = c.req.param("id");

    if (!task) {
      return c.json({ error: "Task ID is required" }, 400);
    }

    const payload = await c.req.json();

    const result = await trigger(task, payload);

    return c.json(result);
  };
}
