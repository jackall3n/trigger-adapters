import { tasks } from "@trigger.dev/sdk";

type Handle = Awaited<ReturnType<typeof tasks.trigger>>;

type TriggerResult<Payload = unknown> = {
  taskId: string;
  payload: Payload;
  handle: Handle;
};

export async function trigger<Payload = unknown>(id: string, payload: Payload): Promise<TriggerResult<Payload>> {
  const handle = await tasks.trigger(id, payload);

  return {
    handle,
    taskId: id,
    payload,
  };
}
