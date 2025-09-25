import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { trigger } from "./core";

export type NextjsHandler = {
  POST: (request: Request) => Promise<NextResponse>;
  handle: (request: NextApiRequest, response: NextApiResponse) => Promise<void>;
};

export function handler(): NextjsHandler {
  return {
    POST: async (request: Request) => {
      const taskId = request.url.split("/").pop();

      if (!taskId) {
        return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
      }

      const payload = await request.json();

      const response = await trigger(taskId, payload);

      return NextResponse.json(response);
    },
    handle: async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
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
