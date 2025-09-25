import type { NextApiRequest, NextApiResponse } from "next";
import { trigger } from "./core";

export function handler() {
	return {
		POST: async (request: Request) => {
			const taskId = request.url.split("/").pop();

			if (!taskId) {
				return Response.json({ error: "Task ID is required" }, { status: 400 });
			}

			const payload = await request.json();

			const response = await trigger(taskId, payload);

			return Response.json(response);
		},
		handle: async (request: NextApiRequest, response: NextApiResponse) => {
			if (request.method !== "POST") {
				return response.status(405).json({ error: "Method not allowed" });
			}

			const { id: taskId } = request.query;

			if (!taskId || typeof taskId !== "string") {
				return response.status(400).json({ error: "Task ID is required" });
			}

			const payload = request.body;

			const result = await trigger(taskId, payload);

			response.status(200).json(result);
		},
	};
}
