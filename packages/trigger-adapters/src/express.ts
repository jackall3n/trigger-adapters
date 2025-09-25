import type { Request, Response } from "express";
import { trigger } from "./core";

export function handler() {
    return async (request: Request, response: Response) => {
        const task = request.params.id;

        if (!task) {
            return response.status(400).json({ error: "Task ID is required" });
        }

        const payload = request.body;

        const result = await trigger(task, payload);

        response.send(result);
    };
}
