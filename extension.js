const vscode = require('vscode');
const localizer = require( 'app-localizer' );
const fs = require('fs');

const createNewMessage = 'Settings file had been created. Update wont take effect until restart vscode';
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
		const vsSettingsCommand = vscode.commands.registerCommand('extension.applocalizer.settings', () => {
			const settingsDir = `${vscode.workspace.rootPath}\\.vscode`;
			const settingsPath = `${settingsDir}\\applocalizer.json`;

			if(vscode.workspace.rootPath) {
				fs.stat(settingsPath, (err) => {
					if(!err) {
						vscode.workspace.openTextDocument(settingsPath).then(doc => {
							vscode.window.showTextDocument(doc);
						});
					} else {
						const options = ['Create New', 'Cancel'];

						vscode.window.showQuickPick(options)
							.then((option) => {
								if(option === options[0]) {
									vscode.workspace.openTextDocument(vscode.Uri.parse(`untitled:${settingsPath}`)).then(doc => {
										vscode.window.showTextDocument(doc).then((editor) => {
											editor.edit(edit => {
												edit.insert(new vscode.Position(0, 0), exampleJson);
												vscode.window.showInformationMessage(createNewMessage);
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

		if(vscode.workspace.rootPath) {
			const settingsPath = `${vscode.workspace.rootPath}/.vscode/applocalizer.json`;

			fs.stat(settingsPath, (err) => {
				if(!err) {
					fs.readFile(settingsPath, (err, buffer) => {
						if(err) {
							console.error(err);
						} else {
							const settings = JSON.parse(buffer);
							const vsPseudoReplaceCommand = vscode.commands.registerCommand('extension.applocalizer.pseudoReplace', () => {
								vscode.window.activeTextEditor.edit(edit => {
									if(!vscode.window.activeTextEditor.selection.isEmpty) {
										const text = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
										edit.replace(vscode.window.activeTextEditor.selection, localizer.toPseudoText(text, settings.pseudoLocale));
									}
								});
							});
							context.subscriptions.push(vsPseudoReplaceCommand);

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
								if(settings.validator && settings.validator.filePathPattern && vscode.languages.match({ pattern: settings.validator.filePathPattern }, document)) {
									const text = document.getText();
									let result = undefined;
									if(settings.validator.multiFile) {
										const path = document.fileName.substring(0, document.fileName.lastIndexOf('\\'));
										localizer.validateLocales(path, settings.validator, JSON.parse(text), (result) => processValidationResult(result, text, document));
									} else {
										result = localizer.validateLocalesContent(JSON.parse(text));
										processValidationResult(result, text, document);
									}
								}
							}
							vscode.window.onDidChangeActiveTextEditor((event) => validate(event.document));
							vscode.workspace.onDidChangeTextDocument((event) => validate(event.document));
							if(vscode.window.activeTextEditor) {
								validate(vscode.window.activeTextEditor.document);
							}
						}
					});

				}

			});

		}
	} catch(err) {
		console.error(err);
	}
}

exports.activate = activate;

function deactivate() {
}

exports.deactivate = deactivate;
