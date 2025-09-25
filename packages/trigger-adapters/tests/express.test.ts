import { tasks } from "@trigger.dev/sdk";
import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { handler } from "../src/express";

const createRequest = (id: string, payload: unknown): Request => {
    return {
        params: id ? { id } : {},
        body: payload,
    } as unknown as Request;
};

const res = {
    send: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response;

const trigger = vi.mocked(tasks.trigger);

describe("Express Adapter", () => {
    it("should trigger task with valid request", async () => {
        const req = createRequest("test-task", {
            name: "Test User",
            email: "test@example.com",
        });

        await handler()(req, res);

        expect(trigger).toHaveBeenCalledWith("test-task", {
            name: "Test User",
            email: "test@example.com",
        });

        expect(res.send).toHaveBeenCalledWith({
            taskId: "test-task",
            payload: {
                name: "Test User",
                email: "test@example.com",
            },
            handle: {
                id: "run_abc123",
                publicAccessToken: "test-token",
                taskIdentifier: "test-task",
            },
        });
    });

    it("should handle missing task ID", async () => {
        const req = createRequest(undefined as unknown as string, {
            test: "data",
        });

        await handler()(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Task ID is required" });
        expect(trigger).not.toHaveBeenCalled();
    });

    it("should handle array payload", async () => {
        const req = createRequest("test-task", [1, 2, 3]);

        await handler()(req, res);

        expect(trigger).toHaveBeenCalledWith("test-task", [1, 2, 3]);
        expect(res.send).toHaveBeenCalledWith({
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

        const req = createRequest("test-task", payload);

        await handler()(req, res);
        expect(res.send).toHaveBeenCalledWith({
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
        const req = createRequest("test-task-123_ABC", { test: "data" });

        await handler()(req, res);

        expect(trigger).toHaveBeenCalledWith("test-task-123_ABC", {
            test: "data",
        });
        expect(res.send).toHaveBeenCalledWith({
            taskId: "test-task-123_ABC",
            payload: { test: "data" },
            handle: {
                id: "run_abc123",
                publicAccessToken: "test-token",
                taskIdentifier: "test-task-123_ABC",
            },
        });
    });

    it("should handle null payload", async () => {
        const req = createRequest("test-task", null);

        await handler()(req, res);

        expect(trigger).toHaveBeenCalledWith("test-task", null);
        expect(res.send).toHaveBeenCalledWith({
            taskId: "test-task",
            payload: null,
            handle: {
                id: "run_abc123",
                publicAccessToken: "test-token",
                taskIdentifier: "test-task",
            },
        });
    });

    it("should pass through to next middleware on success", async () => {
        const req = createRequest("test-task", { test: "data" });

        await handler()(req, res);

        expect(res.send).toHaveBeenCalledWith({
            taskId: "test-task",
            payload: { test: "data" },
            handle: {
                id: "run_abc123",
                publicAccessToken: "test-token",
                taskIdentifier: "test-task",
            },
        });
    });

    it("should handle boolean payloads", async () => {
        const req = createRequest("test-task", true);

        await handler()(req, res);

        expect(trigger).toHaveBeenCalledWith("test-task", true);
        expect(res.send).toHaveBeenCalledWith({
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
