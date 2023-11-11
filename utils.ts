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
