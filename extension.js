'use strict';
const vscode = require('vscode');
const mapping = require( './mapping.json' );
const numbers = require( './numbers.json' );
const fs = require('fs');

const createNewMessage = 'Settings file had been created. Update wont take effect until restart vscode';
const exampleJson = `{
	"validator": {
		"filePathPattern": "**/locales.json"
	},
	"pseudoLocale": {
		"expander": 0.3,
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
										const localize = function localize(text) {
											if(settings.pseudoLocale.expander) {
												let charCount = Math.round(text.length * settings.pseudoLocale.expander);
												let wordIndex = 0;
												let expansion = charCount;
												while (expansion > 0) {
													const word = numbers.words[wordIndex % numbers.words.length];
													text += ` ${word}`;
													expansion -= word.length + 1;
													wordIndex += 1;
												}
											}
											if(settings.pseudoLocale.accents) {
												let pseudo = '';
												[...text].forEach(letter => {
													pseudo += mapping[letter];
												});
												text = pseudo;
											}
											if(settings.pseudoLocale.rightToLeft) {
												const RLO = '\u202e';
												const PDF = '\u202c';
												const RLM = '\u200F';
												text = RLM + RLO + text + PDF + RLM;
											}
											if(settings.pseudoLocale.exclamations) {
												text = `!!! ${text} !!!`;
											}
											if(settings.pseudoLocale.brackets) {
												text = settings.pseudoLocale.exclamations ? `[${text}]` : `[ ${text} ]`;
											}
											return text;
										}
										const text = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
										edit.replace(vscode.window.activeTextEditor.selection, localize(text));
									}
								});
							});
							context.subscriptions.push(vsPseudoReplaceCommand);

							const collection = vscode.languages.createDiagnosticCollection('Applocalizer');
							const validate = function validate(document) {
								if(settings.validator && settings.validator.filePathPattern && vscode.languages.match({ pattern: settings.validator.filePathPattern }, document)) {
									const text = document.getText();
									const localesData = JSON.parse(text);
									const locales = Object.keys(localesData);
									let diagnostics = [];
									locales.forEach((key) => {
										const localeLabels = Object.keys(localesData[key]);
										localeLabels.forEach((label) => {
											let missing = [];
											locales.forEach((l) => {
												if(!Object.keys(localesData[l]).some(key => key === label)) {
													missing.push(l);
												}
											});
											if(missing.length) {
												const localeLocation = text.search(`"${key}"`);
												const location = text.substring(localeLocation).search(`"${label}"`);
												const position = vscode.window.activeTextEditor.document.positionAt(localeLocation + location);
												const range = new vscode.Range(position, new vscode.Position(position.line, position.character + `"${label}"`.length));

												diagnostics.push(new vscode.Diagnostic(range, `Label "${label}" is missing in "${missing.join()}" locale(s)`, vscode.DiagnosticSeverity.Error));
											}
										});
									});
									collection.set(document.uri, diagnostics);
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
