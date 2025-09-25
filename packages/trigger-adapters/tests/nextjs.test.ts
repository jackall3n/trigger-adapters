import { tasks } from "@trigger.dev/sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { describe, expect, it, vi } from "vitest";
import { handler } from "../src/nextjs";
import { createRequest } from "./test-utils";

const trigger = vi.mocked(tasks.trigger);

describe("Next.js Adapter", () => {
    describe("App Router", () => {
        const { POST } = handler();

        it("should trigger task with valid request", async () => {
            const request = createRequest(
                "http://localhost/api/trigger/test-task",
                {
                    name: "Test User",
                    email: "test@example.com",
                },
            );

            const response = await POST(request);

            expect(trigger).toHaveBeenCalledWith("test-task", {
                name: "Test User",
                email: "test@example.com",
            });

            const data = await response.json();
            expect(data).toEqual({
                taskId: "test-task",
                handle: {
                    id: "run_abc123",
                    publicAccessToken: "test-token",
                    taskIdentifier: "test-task",
                },
                payload: {
                    name: "Test User",
                    email: "test@example.com",
                },
            });
            expect(response.status).toBe(200);
        });

        it("should handle missing task ID", async () => {
            const request = createRequest("http://localhost/api/trigger/", {
                test: "data",
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: "Task ID is required" });
            expect(trigger).not.toHaveBeenCalled();
        });

        it("should handle empty request body", async () => {
            const request = createRequest(
                "http://localhost/api/trigger/test-task",
                {},
            );

            const response = await POST(request);

            expect(trigger).toHaveBeenCalledWith("test-task", {});
            expect(response.status).toBe(200);
        });
    });

    describe("Pages Router", () => {
        const { handle } = handler();

        it("should trigger task with valid request", async () => {
            const req = {
                method: "POST",
                query: { id: "test-task" },
                body: { name: "Test User", email: "test@example.com" },
            };

            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            };

            await handle(
                req as unknown as NextApiRequest,
                res as unknown as NextApiResponse,
            );

            expect(trigger).toHaveBeenCalledWith("test-task", {
                name: "Test User",
                email: "test@example.com",
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                taskId: "test-task",
                handle: {
                    id: "run_abc123",
                    publicAccessToken: "test-token",
                    taskIdentifier: "test-task",
                },
                payload: {
                    name: "Test User",
                    email: "test@example.com",
                },
            });
        });

        it("should handle missing task ID in Pages Router", async () => {
            const req = {
                method: "POST",
                query: {},
                body: { test: "data" },
            };

            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            };

            await handle(
                req as unknown as NextApiRequest,
                res as unknown as NextApiResponse,
            );

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Task ID is required",
            });
            expect(trigger).not.toHaveBeenCalled();
        });

        it("should handle non-POST methods", async () => {
            const req = {
                method: "GET",
                query: { id: "test-task" },
            };

            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            };

            await handle(
                req as unknown as NextApiRequest,
                res as unknown as NextApiResponse,
            );

            expect(res.status).toHaveBeenCalledWith(405);
            expect(res.json).toHaveBeenCalledWith({
                error: "Method not allowed",
            });
            expect(trigger).not.toHaveBeenCalled();
        });
    });

    describe("Edge cases", () => {
        const { POST } = handler();

        it("should handle array payload", async () => {
            const request = createRequest(
                "http://localhost/api/trigger/test-task",
                [1, 2, 3],
            );

            const response = await POST(request);

            expect(trigger).toHaveBeenCalledWith("test-task", [1, 2, 3]);
            expect(response.status).toBe(200);
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

            const request = createRequest(
                "http://localhost/api/trigger/test-task",
                payload,
            );

            const response = await POST(request);

            expect(trigger).toHaveBeenCalledWith("test-task", payload);
            expect(response.status).toBe(200);
        });

        it("should handle special characters in task ID", async () => {
            const taskId = "test-task-123_ABC";

            const request = createRequest(
                `http://localhost/api/trigger/${taskId}`,
                {
                    test: "data",
                },
            );

            const response = await POST(request);
            const data = await response.json();

            expect(trigger).toHaveBeenCalledWith(taskId, { test: "data" });
            expect(response.status).toBe(200);
            expect(data.taskId).toEqual(taskId);
        });
    });
});
