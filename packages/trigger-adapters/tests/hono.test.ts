import { tasks } from "@trigger.dev/sdk";
import type { Context } from "hono";
import { describe, expect, it, vi } from "vitest";
import { handler } from "../src/hono";

const createContext = (id: string, payload: unknown): Context => {
  return {
    req: {
      param: vi.fn().mockReturnValue(id),
      json: vi.fn().mockResolvedValue(payload),
    },
    json: vi.fn().mockImplementation((data) => Response.json(data)),
  } as unknown as Context;
};

const trigger = vi.mocked(tasks.trigger);

describe("Hono Adapter", () => {
  it("should trigger task with valid request", async () => {
    const context = createContext("test-task", {
      name: "Test User",
      email: "test@example.com",
    });

    const response = await handler()(context);
    const data = await response.json();

    expect(context.req.param).toHaveBeenCalledWith("id");
    expect(context.req.json).toHaveBeenCalled();
    expect(trigger).toHaveBeenCalledWith("test-task", {
      name: "Test User",
      email: "test@example.com",
    });
    expect(data).toEqual({
      handle: {
        id: "run_abc123",
        publicAccessToken: "test-token",
        taskIdentifier: "test-task",
      },
      taskId: "test-task",
      payload: {
        name: "Test User",
        email: "test@example.com",
      },
    });
  });

  it("should handle missing task ID", async () => {
    const context = createContext(undefined as unknown as string, {
      test: "data",
    });
    const response = await handler()(context);
    const data = await response.json();

    expect(context.json).toHaveBeenCalledWith({ error: "Task ID is required" }, 400);
    expect(trigger).not.toHaveBeenCalled();
    expect(data).toEqual({ error: "Task ID is required" });
  });

  it("should handle array payload", async () => {
    const context = createContext("test-task", [1, 2, 3]);

    const response = await handler()(context);
    const data = await response.json();

    expect(trigger).toHaveBeenCalledWith("test-task", [1, 2, 3]);
    expect(data).toEqual({
      taskId: "test-task",
      payload: [1, 2, 3],
      handle: {
        id: "run_abc123",
        publicAccessToken: "test-token",
        taskIdentifier: "test-task",
      },
    });
  });

  it("should handle deeply nested objects", async () => {
    const payload = {
      user: {
        profile: {
          settings: {
            notifications: {
              email: true,
              push: false,
            },
          },
        },
      },
    };

    const context = createContext("test-task", payload);

    const response = await handler()(context);
    const data = await response.json();

    expect(trigger).toHaveBeenCalledWith("test-task", payload);
    expect(data).toEqual({
      taskId: "test-task",
      payload: payload,
      handle: {
        id: "run_abc123",
        publicAccessToken: "test-token",
        taskIdentifier: "test-task",
      },
    });
  });

  it("should handle special characters in task ID", async () => {
    const taskId = "test-task-123_ABC";
    const context = createContext(taskId, { test: "data" });

    const response = await handler()(context);
    const data = await response.json();

    expect(trigger).toHaveBeenCalledWith(taskId, {
      test: "data",
    });
    expect(data).toEqual({
      taskId: taskId,
      payload: { test: "data" },
      handle: {
        id: "run_abc123",
        publicAccessToken: "test-token",
        taskIdentifier: taskId,
      },
    });
  });

  it("should handle large payloads", async () => {
    const largePayload = {
      data: Array(1000)
        .fill(null)
        .map((_, i) => ({
          id: i,
          value: `item-${i}`,
          nested: { deep: { value: i } },
        })),
    };

    const context = createContext("test-task", largePayload);

    const response = await handler()(context);
    const data = await response.json();

    expect(trigger).toHaveBeenCalledWith("test-task", largePayload);
    expect(data).toEqual({
      taskId: "test-task",
      payload: largePayload,
      handle: {
        id: "run_abc123",
        publicAccessToken: "test-token",
        taskIdentifier: "test-task",
      },
    });
  });

  it("should handle boolean and number payloads", async () => {
    const context = createContext("test-task", true);

    const response = await handler()(context);
    const data = await response.json();

    expect(trigger).toHaveBeenCalledWith("test-task", true);
    expect(data).toEqual({
      taskId: "test-task",
      payload: true,
      handle: {
        id: "run_abc123",
        publicAccessToken: "test-token",
        taskIdentifier: "test-task",
      },
    });
  });
});
