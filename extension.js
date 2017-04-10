'use strict';
const vscode = require('vscode');
const childProcess = require( 'child_process' );
const kill = require( 'tree-kill' );
const fs = require('fs');

const statusBarItems = {};
const createNewMessage = 'Settings file had been created. Update wont take effect until restart vscode';
const exampleJson = `{
	"validator":
    {
        "autoFix": false,
        "localizationFiles": "./locales/*.json"
    },
	"pseudo":
    {
        "expander": 30,
        "brackets": true,
        "accents": true
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
