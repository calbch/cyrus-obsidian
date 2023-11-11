export const handshake = async (url: string): Promise<boolean> => {
	console.log(`${url}/handshake`);
	try {
		const response = await fetch(`${url}/handshake`, { method: "HEAD" });
		return response.ok;
	} catch {
		return false;
	}
};
