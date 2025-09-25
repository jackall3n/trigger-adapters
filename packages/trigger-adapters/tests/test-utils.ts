// biome-ignore lint/suspicious/noExplicitAny: matches the type accepted by JSON.stringify
export function createRequest(url: string, data: any) {
	return new Request(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
}
