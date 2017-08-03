# Application Localizer Visual Studio Code Extension

Application Localizer Visual Studio Code Extension that helps with localizing applications.

[Pseudo Locale Generator Web Site](https://ppatotski.github.io/app-localizer/)

> Utilizes [app-localizer](https://github.com/ppatotski/app-localizer)
>
> [![NPM Package](https://img.shields.io/npm/v/app-localizer.svg)](https://www.npmjs.com/package/app-localizer)

## Features

* Locale validator
	- Check for missing labels
	- Multi-file locale support (see [example](#multi-file-locale-example) below)
		* Polymer file structure
		* Angular flat file structure
* Pseudo localizer
    - Accents on letters
    - Longer sentence
    - Longer word
    - Right-to-Left
    - Enclose in exclamations
    - Enclose in brackets
	- Support [ICU Message syntax](https://formatjs.io/guides/message-syntax/)
* Create default settings file (`Ctrl+Shift+P` or `Cmd+Shift+P` type `Applocalizer: Settings`)
	- Apply settings immediately after saving changes in `./.vscode/applocalizer.json` file
	- Support comments in JSON as an extension to JSON specification

## Get Started

[![Get Started](getstarted.gif)](getstarted.gif)

## Demo

[![Demo](demo.gif)](demo.gif)

## Settings Reference

Locale validator options
* **filePathPattern** Locale files path (supports node glob pattern).
* **multiFile** Each locale is in separate file in the same folder.
* **fileStructure** Structure of locale file content (`polymer` or `angular.flat` file structure).

Pseudo locale generator options
* **expander** Sentence expand factor 0.3 = 30%.
* **wordexpander** Word expand factor 0.5 = 50%.
* **brackets** Enclose sentence in brackets.
* **exclamations** Enclose sentence in exclamations.
* **accents** Convert letter to its accent version.
* **rightToLeft** RTL writing systems.
* **forceException** Force throwing syntax exception if any.
* **escapeCharacters** Escape special characters (`false` for json content)

## Config file example (`./.vscode/applocalizer.json`)
```json
{
	"validator": {
		"multiFile": false,
		"filePathPattern": "**/locales.json",
		"fileStructure": "polymer"
	},
	"pseudoLocale": {
		"expander": 0.3,
		"exclamations": true,
		"brackets": true,
		"accents": true,
		"rightToLeft": false,
		"wordexpander": 0.5,
		"forceException": false,
		"escapeCharacters": false
	}
}
```

## Single-File locale example `/locales/locale.json`
```json
{
	"en-us": {
		"label3": "blah3 {token}",
		"label1": "blah1",
		"label2": "blah2",
		"label4": "blah4"
	},
	"de-de": {
		"label3": "blah3 {token}",
		"label1": "blah1",
		"label2": "blah2",
		"label4": "blah4"
	}
}
```

## Multi-File locale example

### file with en-us locale `/locales/en-us.locale.json` (polymer file structure)
```json
{
	"en-us": {
		"label3": "blah3 {token}",
		"label1": "blah1",
		"label2": "blah2",
		"label4": "blah4"
	}
}
```

### file with fr locale `/locales/fr.locale.json` (angular flat file structure)
```json
{
	"label1": "blah1 {{token}}",
	"label2": "blah2",
	"label5": "blah3",
	"label3": "blah4"
}
```

## Change Log

[Change Log](CHANGELOG.md)

## License

[MIT](LICENSE.md)
