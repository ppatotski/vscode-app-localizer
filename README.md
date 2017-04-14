# Visual Studio Code Command bar

Visual Studio Code Application Localizer.

## Get Started

[![Get Started](getstarted.gif)](getstarted.gif)

## Features

* Pseudo localizer (char mapping/words is taken from [pseudolocalization-tool](https://code.google.com/archive/p/pseudolocalization-tool/))
    - Accents on letters
    - Longer sentence
    - Right-to-Left
    - Enclose in exclamations
    - Enclose in brackets
* Locale validator
	- Check for missing labels (single json format file e.g. polymer)
* Create default settings

[![Demo](demo.gif)](demo.gif)

## Configuration

### Config file example (`./.vscode/applocalizer.json`)
```json
{
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
}
```

### Configuration file schema (documentation)
```json
{
	"validator": {
		"type": "object",
		"description": "Validate locales (checking for missing labels)",
		"properties": {
			"filePathPattern": {
				"type": "string",
				"description": "Pattern of locale files path",
				"default": "**/locales.json"
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

## Change Log

[Change Log](CHANGELOG.md)

## License

[MIT](LICENSE.md)
