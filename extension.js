const vscode = require("vscode");
const localizer = require("app-localizer");
const fs = require("fs");
const path = require("path");
const strip = require("strip-json-comments");

const exampleJson = `{
	"validator": {
		"multiFile": false,
		"filePathPattern": "**/locales.json",
		"fileStructure": "polymer"
	},
	"pseudoLocale": {
		"expander": 0.3,
		"wordexpander": 0.5,
		"exclamations": true,
		"brackets": true,
		"accents": true,
		"rightToLeft": false,
		"escapeCharacters": false
	}
}`;

function activate(context) {
	try {
		let workspaceSettings = false;
		let settingsPath = path.join(
      process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
      "applocalizer.json"
    );
		let settings = undefined;
		const vsSettingsCommand = vscode.commands.registerCommand("extension.applocalizer.settings", () => {
			fs.stat(settingsPath, err => {
				if (!err && workspaceSettings) {
					vscode.workspace.openTextDocument(settingsPath).then(doc => {
						vscode.window.showTextDocument(doc);
					});
				} else {
					const options = [];
					if (vscode.workspace && vscode.workspace.rootPath) {
						options.push("Create Workspace Settings");
					}
					if (err) {
						options.push("Create Global Settings");
					} else {
						options.push("Open Global Settings");
					}
					options.push("Cancel");

					vscode.window.showQuickPick(options).then(option => {
						let pathToSettings = settingsPath;
						if (option === "Create Workspace Settings") {
							pathToSettings = path.join(
                        vscode.workspace.rootPath,
                        ".vscode",
                        "applocalizer.json"
                      );
						}
						if (option === "Create Workspace Settings" || option === "Create Global Settings") {
							vscode.workspace
								.openTextDocument(
                          vscode.Uri.parse(`untitled:${pathToSettings}`)
                        )
								.then(doc => {
									vscode.window.showTextDocument(doc).then(editor => {
										editor.edit(edit => {
											edit.insert(new vscode.Position(0, 0), exampleJson);
										});
									});
								});
						} else if (option === "Open Global Settings") {
							vscode.workspace.openTextDocument(pathToSettings).then(doc => {
								vscode.window.showTextDocument(doc);
							});
						}
					});
				}
			});
		});

		context.subscriptions.push(vsSettingsCommand);
		const vsPseudoReplaceCommand = vscode.commands.registerCommand("extension.applocalizer.pseudoReplace", () => {
			vscode.window.activeTextEditor.edit(edit => {
				if (
            !vscode.window.activeTextEditor.selection.isEmpty &&
            settings &&
            settings.pseudoLocale
          ) {
					  let text = vscode.window.activeTextEditor.document.getText(
              vscode.window.activeTextEditor.selection
            );
					if (!settings.pseudoLocale.escapeCharacters) {
						text = JSON.parse(`{ "text": "${text}" }`).text;
					}
              // Need to think about better way to deal with escapes in text
					const result = localizer.toPseudoText(text, settings.pseudoLocale);
					edit.replace(vscode.window.activeTextEditor.selection, result);
				}
			});
		});

		context.subscriptions.push(vsPseudoReplaceCommand);
		const collection = vscode.languages.createDiagnosticCollection(
      "app-localizer"
    );

		context.subscriptions.push(collection);
		const processValidationResult = function processValidationResult(
      result,
      text,
      document
    ) {
			const diagnostics = [];
			if (result) {
				Object.keys(result).forEach(localeName => {
					Object.keys(result[localeName]).forEach(label => {
						let pos;
						if (settings.validator.fileStructure === "angular.flat") {
							pos = text.search(`"${label}"`);
						} else {
							const localeLocation = text.search(`"${localeName}"`);
							const location = text
                .substring(localeLocation)
                .search(`"${label}"`);
							pos = localeLocation + location;
						}
						const position = vscode.window.activeTextEditor.document.positionAt(pos);
						const range = new vscode.Range(
              position,
              new vscode.Position(
                position.line,
                position.character + `"${label}"`.length
              )
            );

						diagnostics.push(
              new vscode.Diagnostic(
                range,
                `Label "${label}" is missing in "${result[localeName][label].join()}" locale(s)`,
                vscode.DiagnosticSeverity.Error
              )
            );
					});
				});
			}
			collection.set(document.uri, diagnostics);
		};

		const validate = function validate(document) {
			if (
        settings &&
        settings.validator &&
        settings.validator.filePathPattern &&
        vscode.languages.match(
          { pattern: settings.validator.filePathPattern },
          document
        )
      ) {
				const text = document.getText();
				let result = undefined;
				if (settings.validator.multiFile) {
					const folder = path.dirname(document.fileName);
					localizer.validateLocales(
            folder,
            settings.validator,
            JSON.parse(text),
            result => processValidationResult(result, text, document)
          );
				} else {
					result = localizer.validateLocalesContent(JSON.parse(text));
					processValidationResult(result, text, document);
				}
			}
		};

		vscode.window.onDidChangeActiveTextEditor(event =>
      validate(event.document)
    );

		vscode.workspace.onDidChangeTextDocument(event => validate(event.document));

		const invalidateSettings = function invalidateSettings() {
			fs.stat(settingsPath, err => {
				if (!err) {
					fs.readFile(settingsPath, (err, buffer) => {
						if (err) {
							console.error(err);
						} else {
							settings = JSON.parse(strip(buffer.toString()));
							collection.clear();
							if (vscode.window.activeTextEditor) {
								validate(vscode.window.activeTextEditor.document);
							}
						}
					});
				} else {
					settings = undefined;
				}
			});
		};

		vscode.workspace.onDidSaveTextDocument(doc => {
			const selector = [];
			selector.push({ pattern: settingsPath });
			if (vscode.workspace && vscode.workspace.rootPath) {
				selector.push({
					pattern: path.join(
            vscode.workspace.rootPath,
            ".vscode",
            "applocalizer.json"
          )
				});
			}
			if (vscode.languages.match(selector, doc)) {
				if (
          vscode.workspace &&
          vscode.workspace.rootPath &&
          doc.fileName ===
            path.join(vscode.workspace.rootPath, ".vscode", "applocalizer.json")
        ) {
					settingsPath = doc.fileName;
					workspaceSettings = true;
				}
				invalidateSettings();
			}
		});

		if (vscode.workspace && vscode.workspace.rootPath) {
			const workspacePath = path.join(
        vscode.workspace.rootPath,
        ".vscode",
        "applocalizer.json"
      );
			fs.stat(workspacePath, err => {
				if (!err) {
					settingsPath = workspacePath;
					workspaceSettings = true;
				}
				invalidateSettings();
			});
		} else {
			invalidateSettings();
		}
	} catch (err) {
		console.error(err);
	}
}

exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;
