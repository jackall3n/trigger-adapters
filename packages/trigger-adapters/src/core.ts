import { tasks } from "@trigger.dev/sdk";

export async function trigger(id: string, payload: unknown) {
	return tasks.trigger(id, payload);
}
