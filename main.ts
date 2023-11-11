import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import * as path from "path";
import { processFile } from "service";

import { setHandshakeStatus } from "utils";

interface CyrusSettings {
	serverUrl: string;
	classes: string[];
	pdfPath: string;
	notePath: string;
}

const DEFAULT_SETTINGS: CyrusSettings = {
	serverUrl: "http://127.0.0.1:5000",
	classes: ["computer science", "mathematics", "physics"],
	pdfPath: "/assets/pdf",
	notePath: "/inbox",
};

export default class Cyrus extends Plugin {
	settings: CyrusSettings;
	status: HTMLElement;

	async onload() {
		await this.loadSettings();
		const { serverUrl, pdfPath, notePath } = this.settings;

		this.app.vault
			.createFolder(pdfPath)
			.catch(() =>
				console.info(`PDF-Folder at ${pdfPath} already setup ✅`)
			);
		this.app.vault
			.createFolder(notePath)
			.catch(() => console.info(`Note-Folder already setup ✅`));

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
							const file = await this.app.vault.readBinary(
								activeFile
							);
							try {
								new Notice("Processing PDF file... 🚀");
								const response = await processFile(
									serverUrl,
									file,
									["test"]
								);
								if (response) {
									console.log(
										"PDF processing response: ",
										response
									);
									const { class: pdfClass, result } =
										response;

									new Notice(
										"Successfully processed PDF file! 🎉"
									);

									const newPdfPath = path.join(
										pdfPath,
										activeFile.name
									);

									this.app.fileManager.renameFile(
										activeFile,
										newPdfPath
									);

									// const note = await this.app.vault.create(
									// 	notePath,
									// 	result
									// );

									// this.app.fileManager.processFrontMatter(
									// 	note,
									// 	(frontmatter) => {
									// 		frontmatter["class"] = pdfClass;
									// 		// frontmatter["pdf"] =
									// 		// 	this.app.fileManager.generateMarkdownLink();
									// 	}
									// );
								}
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
			// console.log("click", evt);
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

		containerEl.createEl("h2", { text: "General Settings" });

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

		new Setting(containerEl)
			.setName("Classes")
			.setDesc(
				"The classes you are currently taking are used to tag notes."
			)
			.addTextArea((text) =>
				text
					.setPlaceholder("Enter the classes, separated by commas")
					.setValue(this.plugin.settings.classes.join(", "))
					.onChange((value) => {
						this.plugin.settings.classes = value
							.split(",")
							.map((item) => item.trim());
					})
			);

		new Setting(containerEl)
			.setName("PDF Path")
			.setDesc("This is the path where PDFs are stored.")
			.addText((text) =>
				text
					.setPlaceholder("Enter the PDF path")
					.setValue(this.plugin.settings.pdfPath)
					.onChange((value) => {
						this.plugin.settings.pdfPath = value;
					})
			);

		new Setting(containerEl)
			.setName("Note Path")
			.setDesc("This is the path where notes are stored.")
			.addText((text) =>
				text
					.setPlaceholder("Enter the note path")
					.setValue(this.plugin.settings.notePath)
					.onChange((value) => {
						this.plugin.settings.notePath = value;
					})
			);
	}
}
