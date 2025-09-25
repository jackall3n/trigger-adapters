import { expect, test } from "vitest";
import { handler } from "../src/nextjs";

test("nextjs", async () => {
	const { POST } = handler();

	const request = new Request("http://localhost/trigger/task.id", {
		method: "POST",
		body: JSON.stringify({ message: "Hello, world!" }),
	});

	const response = await POST(request);

	expect(response.json()).toEqual({
		message: "Hello, world!",
		taskId: "task.id",
	});
});
