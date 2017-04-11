# Visual Studio Code Command bar

Visual Studio Code Application Localizer.

## Get Started



## Features

* MVP


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
