import type { FastifyReply, FastifyRequest } from "fastify";
import { trigger } from "./core";

interface RouteParams {
    id: string;
}

export function handler() {
    return async (
        request: FastifyRequest<{ Params: RouteParams }>,
        reply: FastifyReply,
    ) => {
        const taskId = request.params.id;

        if (!taskId) {
            return reply.code(400).send({ error: "Task ID is required" });
        }

        try {
            const payload = request.body;
            const result = await trigger(taskId, payload);
            return reply.send(result);
        } catch (_error) {
            return reply.code(500).send({ error: "Failed to trigger task" });
        }
    };
}
