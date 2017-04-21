'use strict';
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

							if(settings.validator && settings.validator.multiFile) {
								const collection = vscode.languages.createDiagnosticCollection('app-localizer');
								context.subscriptions.push(collection);
								const validateMultiFile = function validateMultiFile(document) {
									if(settings.validator && settings.validator.filePathPattern && vscode.languages.match({ pattern: settings.validator.filePathPattern }, document)) {
										// TODO: below code needs to be refactored
										const text = document.getText();
										const localesData = JSON.parse(text);
										const otherLocales = {};
										const fileName = document.fileName.substring(document.fileName.lastIndexOf('\\'));
										const noLocaleKey = settings.validator.fileStructure === 'angular.flat';
										const key = noLocaleKey? fileName : Object.keys(localesData)[0];
										const validate = function validate() {
											const locales = Object.keys(otherLocales);
											let diagnostics = [];
											const localeLabels = Object.keys(noLocaleKey ? localesData : localesData[key]);
											localeLabels.forEach((label) => {
												let missing = [];
												locales.forEach((l) => {
													if(!Object.keys(otherLocales[l]).some(key => key === label)) {
														missing.push(l);
													}
												});
												if(missing.length) {
													const localeLocation = noLocaleKey? 0 : text.search(`"${key}"`);
													const location = text.substring(localeLocation).search(`"${label}"`);
													const position = vscode.window.activeTextEditor.document.positionAt(localeLocation + location);
													const range = new vscode.Range(position, new vscode.Position(position.line, position.character + `"${label}"`.length));

													diagnostics.push(new vscode.Diagnostic(range, `Label "${label}" is missing in "${missing.join()}" locale(s)`, vscode.DiagnosticSeverity.Error));
												}
											});
											collection.set(document.uri, diagnostics);

										}
										const path = document.fileName.substring(0, document.fileName.lastIndexOf('\\'));
										fs.readdir(path, (err, files) => {
											let fileCount = files.length - 1;
											files.forEach(file => {
												if(`${path}\\${file}` !== document.fileName) {
													fs.readFile(`${path}\\${file}`, (err, buffer) => {
														fileCount -= 1;
														const locale = JSON.parse(buffer);
														const localeName = noLocaleKey? file : Object.keys(locale)[0];
														otherLocales[localeName] = noLocaleKey? locale : locale[localeName];
														if(!fileCount) {
															validate();
														}
													});
												}
											});
										})

									}
								}
								vscode.window.onDidChangeActiveTextEditor((event) => validateMultiFile(event.document));
								vscode.workspace.onDidChangeTextDocument((event) => validateMultiFile(event.document));
								if(vscode.window.activeTextEditor) {
									validateMultiFile(vscode.window.activeTextEditor.document);
								}
							} else {
								const collection = vscode.languages.createDiagnosticCollection('app-localizer');
								context.subscriptions.push(collection);
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
