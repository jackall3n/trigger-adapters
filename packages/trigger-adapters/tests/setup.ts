import { tasks } from "@trigger.dev/sdk";
import { afterAll, beforeAll, beforeEach, vi } from "vitest";

vi.mock("@trigger.dev/sdk", () => ({
    tasks: {
        trigger: vi.fn(),
    },
}));

beforeAll(() => {
    vi.mocked(tasks.trigger).mockImplementation(
        (taskIdentifier) =>
            ({
                id: "run_abc123",
                taskIdentifier,
                publicAccessToken: "test-token",
                // biome-ignore lint/suspicious/noExplicitAny: needed
            }) as any,
    );
});

afterAll(() => {
    vi.mocked(tasks.trigger).mockReset();
});

beforeEach(() => {
    vi.mocked(tasks.trigger).mockClear();
});
