'use strict';
const vscode = require('vscode');
const mapping = require( './mapping.json' );
const numbers = require( './numbers.json' );
const fs = require('fs');

const statusBarItems = {};
const createNewMessage = 'Settings file had been created. Update wont take effect until restart vscode';
const exampleJson = `{
    "validator": {
        "autoFix": false,
        "localizationFiles": "./locales/*.json"
    },
	"pseudoLocale": {
        "expander": 0.3,
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

        if(vscode.workspace.rootPath) {
            const settingsPath = `${vscode.workspace.rootPath}/.vscode/applocalizer.json`;
            const channel = vscode.window.createOutputChannel('applocalizer');
        
            fs.stat(settingsPath, (err) => {
                if(!err) {
                    fs.readFile(settingsPath, (err, buffer) => {
                        if(err) {
                            console.error(err);
                        } else {
                            const settings = JSON.parse(buffer);
                            const vsPseudoReplaceCommand = vscode.commands.registerCommand('extension.applocalizer.pseudoReplace', () => {
                                vscode.window.activeTextEditor.selection
                                vscode.window.activeTextEditor.edit(edit => {
                                    if(!vscode.window.activeTextEditor.selection.isEmpty) {
                                        const localize = function localize(text) {
                                            if(settings.pseudoLocale.expander) {
                                                let charCount = text.length * settings.pseudoLocale.expander;
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
                                                [...text].forEach(latter => {
                                                    pseudo += mapping[latter];
                                                });
                                                text = pseudo;
                                            }
                                            if(settings.pseudoLocale.rightToLeft) {
                                                const RLO = '\u202e';
                                                const PDF = '\u202c';
                                                const RLM = '\u200F';
                                                text = RLM + RLO + text + PDF + RLM;
                                            }
                                            if(settings.pseudoLocale.brackets) {
                                                text = `[!!! ${text} !!!]`;
                                            }
                                            return text;
                                        }
                                        const text = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
                                        edit.replace(vscode.window.activeTextEditor.selection, localize(text));
                                    }
                                });
                            });
                            context.subscriptions.push(vsPseudoReplaceCommand);
                        }
                    });
                    
                }
                
            });
            
        }

        context.subscriptions.push(vsSettingsCommand);
    } catch(err) {
        console.error(err);
    }
}

exports.activate = activate;

function deactivate() {
    Object.keys(statusBarItems).forEach((key) => {
        if(statusBarItems[key].process) {
            kill(statusBarItems[key].process.pid);
        }
    });
}

exports.deactivate = deactivate;
