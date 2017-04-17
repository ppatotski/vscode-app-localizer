# Visual Studio Code Application Localizer

Visual Studio Code Application Localizer.

## Features

* Locale validator
	- Check for missing labels
	- Multi-file locale support (see [example](#multi-file-locale-example) below)
		* Polymer file structure
		* Angular flat file structure
* Pseudo localizer (char mapping/words is taken from [pseudolocalization-tool](https://code.google.com/archive/p/pseudolocalization-tool/))
    - Accents on letters
    - Longer sentence
    - Right-to-Left
    - Enclose in exclamations
    - Enclose in brackets
* Create default settings

## Get Started

[![Get Started](getstarted.gif)](getstarted.gif)

## Demo

[![Demo](demo.gif)](demo.gif)

## Configuration

### Config file example (`./.vscode/applocalizer.json`)
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
		"rightToLeft": false
	}
}
```

### Configuration file schema (documentation)
```json
{
	"validator": {
		"type": "object",
		"description": "Validate locales (checking for missing labels)",
		"properties": {
			"multiFile": {
				"type": "boolean",
				"description": "Each locale is in separate file in the same folder.",
				"default": "false"
			},
			"filePathPattern": {
				"type": "string",
				"description": "Pattern of locale files path",
				"default": "**/locales.json"
			},
			"fileStructure": {
				"type": "string",
				"description": "Structure of locale file content",
				"default": "polymer",
				"enum": [
					"polymer",
					"angular.flat"
				]
			}
		}
	},
	"pseudoLocale": {
		"type": "object",
		"description": "Pseudo localizer settings",
		"properties": {
			"expander": {
				"type": "number",
				"description": "Expand factor 0.3 = 30%",
				"default": 0.3
			},
			"brackets": {
				"type": "boolean",
				"description": "Enclose in brackets"
			},
			"exclamations": {
				"type": "boolean",
				"description": "Enclose in exclamations"
			},
			"accents": {
				"type": "boolean",
				"description": "Convert letter to its accent version"
			},
			"rightToLeft": {
				"type": "boolean",
				"description": "Left-to-Right"
			}
		}
	}
}
```

## Multi-File locale example

### file with en-us locale `/locales/en-us.locale.json` (polymer file structure)
```json
{
	"en-us": {
		"label3": "blah3",
		"label1": "blah1",
		"label2": "blah2",
		"label4": "blah4"
	}
}
```

### file with fr locale `/locales/fr.locale.json` (angular flat file structure)
```json
{
	"label1": "blah1",
	"label2": "blah2",
	"label5": "blah3",
	"label3": "blah4"
}
```

## Change Log

[Change Log](CHANGELOG.md)

## License

[MIT](LICENSE.md)
