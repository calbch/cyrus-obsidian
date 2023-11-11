import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { processFile } from "service";

import { setHandshakeStatus } from "utils";

interface CyrusSettings {
	serverUrl: string;
}

const DEFAULT_SETTINGS: CyrusSettings = {
	serverUrl: "http://127.0.0.1:5000",
};

export default class Cyrus extends Plugin {
	settings: CyrusSettings;
	status: HTMLElement;
	canProcess = false;

	async onload() {
		await this.loadSettings();

		this.status = this.addStatusBarItem();

		setHandshakeStatus(this.settings.serverUrl, this.status);

		this.addCommand({
			id: "cyrus-process-pdf",
			name: "Process PDF",
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
				const pdfView = activeFile?.extension === "pdf";
				if (pdfView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						(async () => {
							console.log("active file path", activeFile.path);
							const file = await this.app.vault.readBinary(
								activeFile
							);
							try {
								new Notice("Processing PDF file... 🚀");
								processFile(this.settings.serverUrl, file, [
									"test",
								]);
							} catch {
								new Notice("Error processing PDF file ⚰️");
							}
						})();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		this.addSettingTab(new CyrusSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class CyrusSettingTab extends PluginSettingTab {
	plugin: Cyrus;

	constructor(app: App, plugin: Cyrus) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Server URL")
			.setDesc(
				"This is the URL of the Cyrus server. Either localhost or a remote server."
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter the URL")
					.setValue(this.plugin.settings.serverUrl)
					.onChange(async (value) => {
						this.plugin.settings.serverUrl = value;
					})
			)
			.addButton(async (button) => {
				button.setButtonText("Save").onClick(async () => {
					await this.plugin.saveSettings();
					await setHandshakeStatus(
						this.plugin.settings.serverUrl,
						this.plugin.status
					);
				});
			});
	}
}
