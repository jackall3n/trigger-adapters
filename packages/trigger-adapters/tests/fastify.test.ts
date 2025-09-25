import { tasks } from "@trigger.dev/sdk";
import type { FastifyReply, FastifyRequest } from "fastify";
import { describe, expect, it, vi } from "vitest";
import { handler } from "../src/fastify";

interface RouteParams {
	id: string;
}

const createRequest = (
	id: string,
	payload: unknown,
): FastifyRequest<{ Params: RouteParams }> => {
	return {
		params: { id },
		body: payload,
	} as unknown as FastifyRequest<{ Params: RouteParams }>;
};

const createReply = () => {
	const reply = {
		code: vi.fn().mockReturnThis(),
		send: vi.fn().mockReturnThis(),
	};
	return reply as unknown as FastifyReply;
};

const trigger = vi.mocked(tasks.trigger);

describe("Fastify Adapter", () => {
	it("should trigger task with valid request", async () => {
		const req = createRequest("test-task", {
			name: "Test User",
			email: "test@example.com",
		});
		const reply = createReply();

		await handler()(req, reply);

		expect(trigger).toHaveBeenCalledWith("test-task", {
			name: "Test User",
			email: "test@example.com",
		});

		expect(reply.send).toHaveBeenCalledWith({
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
		const req = createRequest("", { test: "data" });
		const reply = createReply();

		await handler()(req, reply);

		expect(reply.code).toHaveBeenCalledWith(400);
		expect(reply.send).toHaveBeenCalledWith({ error: "Task ID is required" });
		expect(trigger).not.toHaveBeenCalled();
	});

	it("should handle trigger errors", async () => {
		trigger.mockRejectedValueOnce(new Error("Trigger failed"));

		const req = createRequest("test-task", { test: "data" });
		const reply = createReply();

		await handler()(req, reply);

		expect(reply.code).toHaveBeenCalledWith(500);
		expect(reply.send).toHaveBeenCalledWith({
			error: "Failed to trigger task",
		});
	});

	it("should handle array payload", async () => {
		const req = createRequest("test-task", [1, 2, 3]);
		const reply = createReply();

		await handler()(req, reply);

		expect(trigger).toHaveBeenCalledWith("test-task", [1, 2, 3]);
		expect(reply.send).toHaveBeenCalledWith({
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
		const reply = createReply();

		await handler()(req, reply);

		expect(trigger).toHaveBeenCalledWith("test-task", payload);
		expect(reply.send).toHaveBeenCalledWith({
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
		const req = createRequest(taskId, { test: "data" });
		const reply = createReply();

		await handler()(req, reply);

		expect(trigger).toHaveBeenCalledWith(taskId, {
			test: "data",
		});
		expect(reply.send).toHaveBeenCalledWith({
			taskId: taskId,
			payload: { test: "data" },
			handle: {
				id: "run_abc123",
				publicAccessToken: "test-token",
				taskIdentifier: taskId,
			},
		});
	});

	it("should handle null and boolean payloads", async () => {
		const req = createRequest("test-task", null);
		const reply = createReply();

		await handler()(req, reply);

		expect(trigger).toHaveBeenCalledWith("test-task", null);
		expect(reply.send).toHaveBeenCalledWith({
			taskId: "test-task",
			payload: null,
			handle: {
				id: "run_abc123",
				publicAccessToken: "test-token",
				taskIdentifier: "test-task",
			},
		});
	});
});
