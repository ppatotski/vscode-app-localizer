const vscode = require('vscode');
const localizer = require( 'app-localizer' );
const fs = require('fs');
const path = require('path');
const strip = require('strip-json-comments');

const workspaceOnlyMessage = 'Applocalizer can only be enabled if VS Code is opened on a workspace folder';
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
		"rightToLeft": false
	}
}`;

function activate(context) {
	try {
		let settingsPath = '';
		let settings = undefined;
		const vsSettingsCommand = vscode.commands.registerCommand('extension.applocalizer.settings', () => {
			if(!settingsPath) {
				vscode.window.showErrorMessage(workspaceOnlyMessage);
			} else {
				fs.stat(settingsPath, (err) => {
					if(!err) {
						vscode.workspace.openTextDocument(settingsPath).then((doc) => {
							vscode.window.showTextDocument(doc);
						});
					} else {
						const options = ['Create New', 'Cancel'];

						vscode.window.showQuickPick(options)
							.then((option) => {
								if(option === options[0]) {
									vscode.workspace.openTextDocument(vscode.Uri.parse(`untitled:${settingsPath}`)).then((doc) => {
										vscode.window.showTextDocument(doc).then((editor) => {
											editor.edit((edit) => {
												edit.insert(new vscode.Position(0, 0), exampleJson);
											});
										});
									});
								}
							});
					}
				});
			}
		});
		context.subscriptions.push(vsSettingsCommand);
		const vsPseudoReplaceCommand = vscode.commands.registerCommand('extension.applocalizer.pseudoReplace', () => {
			if(!settingsPath) {
				vscode.window.showErrorMessage(workspaceOnlyMessage);
			} else {
				vscode.window.activeTextEditor.edit(edit => {
					if(!vscode.window.activeTextEditor.selection.isEmpty && settings && settings.pseudoLocale) {
						const text = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
						// Need to think about better way to deal with escapes in text
						const result = localizer.toPseudoText(JSON.parse(`{ "text": "${text}" }`).text, settings.pseudoLocale);
						edit.replace(vscode.window.activeTextEditor.selection, result);
					}
				});
			}
		});
		context.subscriptions.push(vsPseudoReplaceCommand);
		if(vscode.workspace && vscode.workspace.rootPath) {
			settingsPath = path.join(vscode.workspace.rootPath, '.vscode', 'applocalizer.json');

			const collection = vscode.languages.createDiagnosticCollection('app-localizer');
			context.subscriptions.push(collection);
			const processValidationResult = function processValidationResult(result, text, document) {
				const diagnostics = [];
				if(result) {
					Object.keys(result).forEach((localeName) => {
						Object.keys(result[localeName]).forEach((label) => {
							const localeLocation = text.search(`"${localeName}"`);
							const location = text.substring(localeLocation).search(`"${label}"`);
							const position = vscode.window.activeTextEditor.document.positionAt(localeLocation + location);
							const range = new vscode.Range(position, new vscode.Position(position.line, position.character + `"${label}"`.length));

							diagnostics.push(new vscode.Diagnostic(range, `Label "${label}" is missing in "${result[localeName][label].join()}" locale(s)`, vscode.DiagnosticSeverity.Error));
						});
					});
				}
				collection.set(document.uri, diagnostics);
			}
			const validate = function validate(document) {
				if(settings && settings.validator && settings.validator.filePathPattern && vscode.languages.match({ pattern: settings.validator.filePathPattern }, document)) {
					const text = document.getText();
					let result = undefined;
					if(settings.validator.multiFile) {
						const folder = path.dirname(document.fileName);
						localizer.validateLocales(folder, settings.validator, JSON.parse(text), (result) => processValidationResult(result, text, document));
					} else {
						result = localizer.validateLocalesContent(JSON.parse(text));
						processValidationResult(result, text, document);
					}
				}
			}
			vscode.window.onDidChangeActiveTextEditor((event) => validate(event.document));
			vscode.workspace.onDidChangeTextDocument((event) => validate(event.document));

			const invalidateSettings = function invalidateSettings() {
				fs.stat(settingsPath, (err) => {
					if(!err) {
						fs.readFile(settingsPath, (err, buffer) => {
							if(err) {
								console.error(err);
							} else {
								settings = JSON.parse(strip(buffer.toString()));
								collection.clear();
								if(vscode.window.activeTextEditor) {
									validate(vscode.window.activeTextEditor.document);
								}
							}
						});

					}
				});
			};
			vscode.workspace.onDidSaveTextDocument((doc) => {
				if(vscode.languages.match({ pattern: settingsPath }, doc)) {
					invalidateSettings();
				}
			});
			invalidateSettings();
		}
	} catch(err) {
		console.error(err);
	}
}

exports.activate = activate;

function deactivate() {
}

exports.deactivate = deactivate;
