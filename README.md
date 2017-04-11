# Visual Studio Code Command bar

Visual Studio Code Application Localizer.

## Get Started

[![Get Started](getstarted.gif)](getstarted.gif)

## Features

* Pseudo localizer (char mapping is taken from [there](https://code.google.com/archive/p/pseudolocalization-tool/))
    - Accents on letters
    - Longer sentence
    - Right-to-Left
    - Brackets wrapping
* Coming soon: Locale validator

[![Demo](demo.gif)](demo.gif)

## Configuration

### Config file example (`./.vscode/applocalizer.json`)
```json
{
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
}
```

### Configuration file schema (documentation)
```json
{
    "validator": {
      "type": "object",
      "description": "Validates locale files"
   },
    "pseudoLocale": {
      "type": "object",
      "description": "Pseudo localizer settings"
   }
}
```

## License

[MIT](LICENSE.md)
