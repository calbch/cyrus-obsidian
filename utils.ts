import { handshake } from "service";

export const setHandshakeStatus = async (
	serverUrl: string,
	status: HTMLElement
) => {
	const handshakeIsSuccessful = await handshake(serverUrl);

	if (handshakeIsSuccessful) {
		status.setText("Cyrus ready ✅");
	} else {
		status.setText("Cyrus unavailable ❌");
	}
};

// use remark if necessary
export const getResultMarkdown = async ({
	title,
	result,
}: {
	title: string;
	result: string;
}): Promise<string> => {
	return `# ${title}\n\n## Summary\n\n${result}`;
};
