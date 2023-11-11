export const handshake = async (url: string): Promise<boolean> => {
	try {
		const response = await fetch(`${url}/handshake`, {
			method: "HEAD",
			// mode: "no-cors",
		});

		return response.ok;
	} catch {
		return false;
	}
};

export const processFile = async (
	url: string,
	file: ArrayBuffer,
	classes: string[]
): Promise<{ class: string; result: string }> => {
	const formData = new FormData();

	try {
		formData.append(
			"file",
			new Blob([file], {
				type: "application/octet-stream",
			})
		);
		formData.append("classes", JSON.stringify(classes));
		const response = await fetch(`${url}/process`, {
			method: "POST",
			body: formData,
			// mode: "no-cors",
		});

		if (!response.ok) {
			throw new Error(`Server responded with ${response.status}`);
		}

		return await response.json();
	} catch (err) {
		console.error(`Failed to submit file to ${url}/process`);
		throw err;
	}
};
