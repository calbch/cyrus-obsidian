export const handshake = async (url: string): Promise<boolean> => {
	console.log(`${url}/handshake`);
	try {
		const response = await fetch(`${url}/handshake`, { method: "HEAD" });
		return response.ok;
	} catch {
		return false;
	}
};

export const processFile = async (
	url: string,
	file: ArrayBuffer,
	classes: string[]
): Promise<void> => {
	const formData = new FormData();

	try {
		formData.append(
			"file",
			new Blob([file], {
				type: "application/octet-stream",
			})
		);
		formData.append("classes", JSON.stringify(classes));
	} catch (err) {
		console.error(`Failed to submit file to ${url}/process`);
		throw err;
	}

	const response = await fetch(`${url}/process`, {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		throw new Error(`Server responded with ${response.status}`);
	}
};
